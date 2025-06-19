import { AppDataSource } from "../config/database";
import { Contact } from "../entities/Contact";
import { Repository } from "typeorm";

export class ContactService {
    // private contactRepository: Repository<Contact>;
    public contactRepository: Repository<Contact>;

    constructor() {
        this.contactRepository = AppDataSource.getRepository(Contact);
    }

    async identifyContact(email?: string, phoneNumber?: string) {
        if (!email && !phoneNumber) {
            throw new Error("Either email or phoneNumber must be provided");
        }

        // Step 1: Find all contacts that match the given email or phone (directly)
        let directMatches = await this.contactRepository.find({
            where: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined }
            ],
            order: { createdAt: "ASC" }
        });

        // Step 2: If no matches, create a new primary contact
        if (directMatches.length === 0) {
            const newContact = this.contactRepository.create({
                email,
                phoneNumber,
                linkPrecedence: "primary"
            });
            await this.contactRepository.save(newContact);
            return {
                contact: {
                    primaryContatctId: newContact.id,
                    emails: email ? [email] : [],
                    phoneNumbers: phoneNumber ? [phoneNumber] : [],
                    secondaryContactIds: []
                }
            };
        }

        // Step 3: Find all contacts transitively linked (by linkedId or id)
        // Gather all related contacts (BFS/DFS style)
        let allRelatedContacts: Contact[] = [...directMatches];
        let seenIds = new Set<number>(directMatches.map(c => c.id));
        let queue = [...directMatches];
        while (queue.length > 0) {
            const current = queue.pop();
            if (!current) continue;
            // Find contacts where linkedId = current.id or id = current.linkedId
            const related = await this.contactRepository.find({
                where: [
                    { linkedId: current.id },
                    { id: current.linkedId || undefined }
                ]
            });
            for (const rel of related) {
                if (!seenIds.has(rel.id)) {
                    allRelatedContacts.push(rel);
                    queue.push(rel);
                    seenIds.add(rel.id);
                }
            }
        }

        // Step 4: Identify all unique primaries
        const primaries = allRelatedContacts.filter(c => c.linkPrecedence === "primary");
        let primaryContact = primaries[0];
        if (primaries.length > 1) {
            // Find the oldest primary
            primaryContact = primaries.reduce((oldest, curr) =>
                curr.createdAt < oldest.createdAt ? curr : oldest
            );
            // Demote other primaries to secondary and relink their secondaries
            for (const otherPrimary of primaries) {
                if (otherPrimary.id !== primaryContact.id) {
                    // Update the other primary
                    otherPrimary.linkPrecedence = "secondary";
                    otherPrimary.linkedId = primaryContact.id;
                    await this.contactRepository.save(otherPrimary);
                    // Update all secondaries linked to this primary
                    const secondaries = allRelatedContacts.filter(c => c.linkedId === otherPrimary.id);
                    for (const sec of secondaries) {
                        sec.linkedId = primaryContact.id;
                        await this.contactRepository.save(sec);
                    }
                }
            }
        }

        // Step 5: If new info, create a new secondary contact
        const hasNewInfo = (email && !allRelatedContacts.some(c => c.email === email)) ||
            (phoneNumber && !allRelatedContacts.some(c => c.phoneNumber === phoneNumber));
        if (hasNewInfo) {
            const newSecondaryContact = this.contactRepository.create({
                email,
                phoneNumber,
                linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            });
            await this.contactRepository.save(newSecondaryContact);
            allRelatedContacts.push(newSecondaryContact);
        }

        // Step 6: Collect all unique emails and phone numbers
        // and all secondary contact IDs
        const emails = Array.from(new Set([
            primaryContact.email,
            ...allRelatedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.email)
        ].filter(Boolean)));
        const phoneNumbers = Array.from(new Set([
            primaryContact.phoneNumber,
            ...allRelatedContacts.filter(c => c.linkPrecedence === "secondary").map(c => c.phoneNumber)
        ].filter(Boolean)));
        const secondaryContactIds = allRelatedContacts
            .filter(c => c.linkPrecedence === "secondary")
            .map(c => c.id);

        return {
            contact: {
                primaryContatctId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds
            }
        };
    }
} 