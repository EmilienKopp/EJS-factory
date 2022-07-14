/***
 * Util functions to streamline the code
 */


/**
 * Checks whether a string is in JSON format
 *
 * @param str string to check
 */
 export function isJSON(str)
 {
     try {
         const parsed = JSON.parse(str);
         if(parsed && typeof parsed === "object") {
             return true;
         }
     } catch {
         return false;
     }
     return false;
 }
 
 /**
  * Transforms an url to add http:// if it doesn't have it
  *
  * @param url url to transform
  */
  export function setProtocol(url) 
 {
     if(url.indexOf('http') === -1){
         return 'http://' + url;
     }
     return url;
 }