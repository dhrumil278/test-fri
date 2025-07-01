CREATE TABLE admin (
    id TEXT NOT NULL, -- required
    "firstName" TEXT DEFAULT NULL,
    "lastName" TEXT DEFAULT NULL,
    email TEXT NOT NULL, -- required
    password TEXT NOT NULL, -- required
    "authToken" TEXT DEFAULT NULL,
    "isActive" BOOLEAN DEFAULT TRUE,
    "createdAt" BIGINT NOT NULL,
    "updatedAt" BIGINT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "updatedBy" TEXT NOT NULL,
    "isDeleted" BOOLEAN DEFAULT FALSE,
    "deletedBy" TEXT DEFAULT NULL,
    "deletedAt" BIGINT DEFAULT NULL,
    PRIMARY KEY (id)
);