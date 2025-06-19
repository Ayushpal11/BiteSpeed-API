"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContactService = void 0;
const database_1 = require("../config/database");
const Contact_1 = require("../entities/Contact");
class ContactService {
    constructor() {
        this.contactRepository = database_1.AppDataSource.getRepository(Contact_1.Contact);
    }
    async identifyContact(email, phoneNumber) {
        if (!email && !phoneNumber) {
            throw new Error("Either email or phoneNumber must be provided");
        }
        const existingContacts = await this.contactRepository.find({
            where: [
                { email: email || undefined },
                { phoneNumber: phoneNumber || undefined }
            ],
            order: {
                createdAt: "ASC"
            }
        });
        if (existingContacts.length === 0) {
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
        const primaryContact = existingContacts.find(c => c.linkPrecedence === "primary") || existingContacts[0];
        const secondaryContacts = existingContacts.filter(c => c.id !== primaryContact.id);
        const hasNewInfo = (email && !existingContacts.some(c => c.email === email)) ||
            (phoneNumber && !existingContacts.some(c => c.phoneNumber === phoneNumber));
        if (hasNewInfo) {
            const newSecondaryContact = this.contactRepository.create({
                email,
                phoneNumber,
                linkedId: primaryContact.id,
                linkPrecedence: "secondary"
            });
            await this.contactRepository.save(newSecondaryContact);
            secondaryContacts.push(newSecondaryContact);
        }
        const allContacts = [primaryContact, ...secondaryContacts];
        const emails = Array.from(new Set(allContacts.map(c => c.email).filter(Boolean)));
        const phoneNumbers = Array.from(new Set(allContacts.map(c => c.phoneNumber).filter(Boolean)));
        return {
            contact: {
                primaryContatctId: primaryContact.id,
                emails,
                phoneNumbers,
                secondaryContactIds: secondaryContacts.map(c => c.id)
            }
        };
    }
}
exports.ContactService = ContactService;
//# sourceMappingURL=ContactService.js.map