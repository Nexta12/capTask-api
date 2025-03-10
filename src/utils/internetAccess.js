
import axios from 'axios'

export const checkInternetConnection = async () => {
    try {
      // Make a small HTTP request to a known server
       await axios.get("https://www.google.com", { timeout: 3000 });

       return true; 
      
    } catch (error) {
      return false; 
    }
  }
