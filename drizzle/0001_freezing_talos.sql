CREATE TABLE `apiSyncLogs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`storeChain` enum('Woolworths','Coles','Aldi','IGA') NOT NULL,
	`status` enum('success','failed','partial') NOT NULL,
	`productsUpdated` int DEFAULT 0,
	`errorMessage` text,
	`syncDuration` int,
	`startedAt` timestamp DEFAULT (now()),
	`completedAt` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `apiSyncLogs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `priceHistory` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(64) NOT NULL,
	`storeId` varchar(64) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`inStock` boolean DEFAULT true,
	`recordedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `priceHistory_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `productPrices` (
	`id` int AUTO_INCREMENT NOT NULL,
	`productId` varchar(64) NOT NULL,
	`storeId` varchar(64) NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`inStock` boolean DEFAULT true,
	`stockLevel` int DEFAULT 0,
	`lastUpdatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`source` enum('api','manual','scraper') DEFAULT 'api',
	`externalId` varchar(255),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `productPrices_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`category` varchar(100) NOT NULL,
	`cuisine` enum('Indian','Italian','Mexican','Alternatives') NOT NULL,
	`description` text,
	`brand` varchar(255),
	`wheatFree` boolean DEFAULT false,
	`dairyFree` boolean DEFAULT false,
	`imageUrl` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `storeLocations` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`chain` enum('Woolworths','Coles','Aldi','IGA','Local Market') NOT NULL,
	`address` varchar(255) NOT NULL,
	`suburb` varchar(100) NOT NULL,
	`postcode` varchar(10) NOT NULL,
	`latitude` decimal(10,6) NOT NULL,
	`longitude` decimal(10,6) NOT NULL,
	`hoursOpen` varchar(5) NOT NULL,
	`hoursClose` varchar(5) NOT NULL,
	`rating` decimal(2,1) DEFAULT '4.0',
	`isActive` boolean DEFAULT true,
	`lastSyncedAt` timestamp DEFAULT (now()),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `storeLocations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `storeChainIdx` ON `apiSyncLogs` (`storeChain`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `apiSyncLogs` (`status`);--> statement-breakpoint
CREATE INDEX `productStoreTimeIdx` ON `priceHistory` (`productId`,`storeId`,`recordedAt`);--> statement-breakpoint
CREATE INDEX `productStoreIdx` ON `productPrices` (`productId`,`storeId`);--> statement-breakpoint
CREATE INDEX `storeIdx` ON `productPrices` (`storeId`);--> statement-breakpoint
CREATE INDEX `priceIdx` ON `productPrices` (`price`);