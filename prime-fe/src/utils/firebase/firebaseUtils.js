import { db } from "./firebaseConfig";
import { collection, addDoc } from "firebase/firestore";

export const addDataToFirestore = async (collectionName, data) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), data);
    return docRef.id;
  } catch (error) {
    console.error("Error adding document: ", error);
    throw error;
  }
};
