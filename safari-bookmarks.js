"use strict";

// Public builds start with an empty bookmark library. Existing local data is
// loaded from Chrome extension storage and is never bundled into the source.
const SAFARI_IMPORT_REVISION = 3;
const SAFARI_IMPORTED_ITEMS = [];
