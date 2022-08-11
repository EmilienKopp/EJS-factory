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

 /**
  * Get the extension of a file from its name
  * @param {string} filename Name of the file
  */
 export function extractFileExtension(filename) {
        return filename.split('.').pop();
 }


export class SmartLogger {
    constructor(logLevel, timers = false) {this.loggingLevel = logLevel; this.timers = timers;}

    loggingLevel;
    timers;

    SmartLog(level, ...args) {
        if (level <= this.loggingLevel) {
            console.log(...args);
        }
    }

    SmartTime( ...args) {
        if (this.timers) console.time(...args);
    }

    SmartTimeEnd(...args) {
        if (this.timers) console.timeEnd(...args);
    }
}





