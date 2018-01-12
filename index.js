const algoliasearch = require('algoliasearch');
const dotenv = require('dotenv');
const functions = require('firebase-functions');

// load values from the .env file in this directory into process.env
dotenv.load();

// configure algolia
const algolia = algoliasearch(
  process.env.ALGOLIA_APP_ID,
  process.env.ALGOLIA_API_KEY
);
const index = algolia.initIndex(process.env.ALGOLIA_INDEX_NAME);

//synchronize firebase database with algolia index
const contactsRef = functions.database.ref('/contactDetail/locationA/{contactID}');

exports.childAdded=contactsRef.onCreate(addOrUpdateIndexRecord);
exports.childChanged=contactsRef.onUpdate(addOrUpdateIndexRecord); 
exports.childRemoved=contactsRef.onDelete(deleteIndexRecord);

function addOrUpdateIndexRecord(contact) {
  console.log("The function addOrUpdateIndexRecord is running!");
  // Get Firebase object
  const record = contact.data.val(); 
  
  // Specify Algolia's objectID using the Firebase object key
  record.objectID = contact.data.key;
  // Add or update object
  return index 
    .saveObject(record)
    .then(() => {
      console.log('Firebase object indexed in Algolia', record.objectID);
    })
    .catch(error => {
      console.error('Error when indexing contact into Algolia', error);
      process.exit(1);
    });      
}

function deleteIndexRecord(contact) {
  // Get Algolia's objectID from the Firebase object key
  const objectID = contact.data.key; 
  // Remove the object from Algolia
  return index
    .deleteObject(objectID)
    .then(() => {
      console.log('Firebase object deleted from Algolia', objectID);
    })
    .catch(error => {
      console.error('Error when deleting contact from Algolia', error);
      process.exit(1);
    });
}

