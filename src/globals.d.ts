/// <reference types="node" />

// Allow TypeScript to accept these modules' types when declaration lookup fails.
// Mongoose ships its own types but some environments may still report TS2307; this file avoids that.
declare module 'mongoose';
declare module 'dotenv';

// Ensure `process` is recognized in all TS files in case node types aren't picked up
declare var process: NodeJS.Process;
