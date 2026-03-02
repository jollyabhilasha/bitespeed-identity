import { prisma } from "../utils/prisma";

export const identifyContact = async (email?: string, phoneNumber?: string) => {

  if (!email && !phoneNumber) {
    throw new Error("Email or phoneNumber required");
  }

  // Step 1: Find matching contacts
  const matchedContacts = await prisma.contact.findMany({
    where: {
      OR: [
        { email: email || undefined },
        { phoneNumber: phoneNumber || undefined }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  // CASE 1: No contact found
  if (matchedContacts.length === 0) {
    const newContact = await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "primary"
      }
    });

    return buildResponse(newContact.id);
  }

  // Find primary contact (oldest)
  let primary = matchedContacts.find(c => c.linkPrecedence === "primary") 
                || matchedContacts[0];

  // If multiple primaries → merge
  const primaries = matchedContacts.filter(c => c.linkPrecedence === "primary");

  if (primaries.length > 1) {
    const oldest = primaries[0];

    for (let p of primaries.slice(1)) {
      await prisma.contact.update({
        where: { id: p.id },
        data: {
          linkPrecedence: "secondary",
          linkedId: oldest.id
        }
      });
    }

    primary = oldest;
  }

  // If new info → create secondary
  const emailExists = matchedContacts.some(c => c.email === email);
  const phoneExists = matchedContacts.some(c => c.phoneNumber === phoneNumber);

  if (!emailExists || !phoneExists) {
    await prisma.contact.create({
      data: {
        email,
        phoneNumber,
        linkPrecedence: "secondary",
        linkedId: primary.id
      }
    });
  }

  return buildResponse(primary.id);
};

const buildResponse = async (primaryId: number) => {

  const contacts = await prisma.contact.findMany({
    where: {
      OR: [
        { id: primaryId },
        { linkedId: primaryId }
      ]
    },
    orderBy: {
      createdAt: "asc"
    }
  });

  const primary = contacts.find(c => c.id === primaryId)!;

  const emails = [...new Set(contacts.map(c => c.email).filter(Boolean))] as string[];
  const phones = [...new Set(contacts.map(c => c.phoneNumber).filter(Boolean))] as string[];

  const secondaryIds = contacts
    .filter(c => c.linkPrecedence === "secondary")
    .map(c => c.id);

  return {
    contact: {
      primaryContactId: primaryId,
      emails,
      phoneNumbers: phones,
      secondaryContactIds: secondaryIds
    }
  };
};