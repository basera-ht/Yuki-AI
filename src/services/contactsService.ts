import * as Contacts from 'expo-contacts';

export interface SimplifiedContact {
  id: string;
  name: string;
  phoneNumbers: string[];
  emails: string[];
}

export const fetchContacts = async (): Promise<SimplifiedContact[] | null> => {
  try {
    const { status } = await Contacts.requestPermissionsAsync();
    
    if (status === 'granted') {
      const { data } = await Contacts.getContactsAsync({
        fields: [Contacts.Fields.PhoneNumbers, Contacts.Fields.Emails],
      });

      if (data.length > 0) {
        // Map the verbose Contacts array into a simplified JSON array
        const simplifiedContacts: SimplifiedContact[] = data.map((contact) => ({
          id: contact.id,
          name: contact.name || 'Unknown',
          phoneNumbers: contact.phoneNumbers ? contact.phoneNumbers.map((p) => p.number || '') : [],
          emails: contact.emails ? contact.emails.map((e) => e.email || '') : [],
        }));
        
        return simplifiedContacts;
      }
    } else {
      console.warn('Contacts permission denied');
      return null;
    }
  } catch (error) {
    console.error('Error fetching contacts:', error);
    return null;
  }
  
  return [];
};
