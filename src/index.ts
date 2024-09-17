import { readFileSync } from "fs";
import diff from "fast-diff";

// Interface for contact data
interface Contact {
  contactID: string;
  firstName: string;
  lastName: string;
  email: string;
  postalZip: string;
  address: string;
}

// Function to compute similarity between two strings
const computeStringSimilarity = (str1: string, str2: string): number => {
  if (!str1 || !str2) return 0;
  const result = diff(str1, str2);
  const matchCount = result.reduce(
    (acc, part) => acc + (part[0] === 0 ? part[1].length : 0),
    0
  );
  return matchCount / Math.max(str1.length, str2.length);
};

// Function to compare two contacts and return a similarity score
const compareContacts = (contact1: Contact, contact2: Contact): number => {
  let score = 0;

  // Email match (most reliable)
  if (contact1.email && contact2.email && contact1.email === contact2.email) {
    score += 0.5;
  }

  // Name similarity (first and last name)
  const fullName1 = `${contact1.firstName} ${contact1.lastName}`;
  const fullName2 = `${contact2.firstName} ${contact2.lastName}`;
  const nameSim = computeStringSimilarity(fullName1, fullName2);
  score += nameSim * 0.3;

  // Postal Zip match
  if (
    contact1.postalZip &&
    contact2.postalZip &&
    contact1.postalZip === contact2.postalZip
  ) {
    score += 0.1;
  }

  // Address match
  const addressSim = computeStringSimilarity(
    contact1.address,
    contact2.address
  );
  score += addressSim * 0.1;

  return score;
};

// Function to find potential duplicate contacts
const findDuplicates = (
  contacts: Contact[]
): {
  contactIDSource: string;
  contactIDMatch: string;
  score: number;
  accuracy: string;
}[] => {
  const matches: {
    contactIDSource: string;
    contactIDMatch: string;
    score: number;
    accuracy: string;
  }[] = [];
  for (let i = 0; i < contacts.length; i++) {
    for (let j = i + 1; j < contacts.length; j++) {
      const score = compareContacts(contacts[i], contacts[j]);
      const accuracy = score >= 0.8 ? "High" : "Low";
      matches.push({
        contactIDSource: contacts[i].contactID,
        contactIDMatch: contacts[j].contactID,
        score: parseFloat(score.toFixed(2)),
        accuracy,
      });
    }
  }
  return matches;
};

// Function to parse contact list from CSV data
const parseContacts = (csvData: string): Contact[] => {
  const lines = csvData.trim().split("\n").slice(1); // Skip header
  return lines.map((line) => {
    const [contactID, firstName, lastName, email, postalZip, address] =
      line.split(",");
    return { contactID, firstName, lastName, email, postalZip, address };
  });
};

// Read contact data from a text file
const readDataFromFile = (filePath: string): string => {
  return readFileSync(filePath, "utf-8");
};

// Main execution
const filePath = "./contacts.csv"; // Path to your .txt file
const csvData = readDataFromFile(filePath);
const contacts = parseContacts(csvData);
const duplicates = findDuplicates(contacts);

// Print results
console.log("ContactID Source | ContactID Match | Score | Accuracy");
duplicates.forEach((match) => {
  console.log(
    `${match.contactIDSource} \t\t| ${match.contactIDMatch} \t\t| ${match.score} \t| ${match.accuracy}`
  );
});
