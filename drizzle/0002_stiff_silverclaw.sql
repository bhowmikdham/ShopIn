CREATE TABLE `cartItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cartId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`storeId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`pricePerUnit` decimal(10,2) NOT NULL,
	`totalPrice` decimal(10,2) NOT NULL,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`cartId` varchar(64) NOT NULL,
	`storeId` varchar(64) NOT NULL,
	`totalAmount` decimal(10,2) NOT NULL,
	`itemCount` int NOT NULL,
	`status` enum('pending','confirmed','ready','completed','cancelled') DEFAULT 'pending',
	`orderDate` timestamp NOT NULL DEFAULT (now()),
	`completedAt` timestamp,
	`notes` text,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shoppingCarts` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`status` enum('active','completed','abandoned') DEFAULT 'active',
	`totalCost` decimal(10,2) DEFAULT '0',
	`itemCount` int DEFAULT 0,
	`preferredStoreId` varchar(64),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	`expiresAt` timestamp,
	CONSTRAINT `shoppingCarts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shoppingListItems` (
	`id` int AUTO_INCREMENT NOT NULL,
	`listId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`isChecked` boolean DEFAULT false,
	`notes` text,
	`addedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `shoppingListItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `shoppingLists` (
	`id` varchar(64) NOT NULL,
	`userId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`isPublic` boolean DEFAULT false,
	`estimatedCost` decimal(10,2),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `shoppingLists_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE INDEX `cartIdx` ON `cartItems` (`cartId`);--> statement-breakpoint
CREATE INDEX `productStoreIdx` ON `cartItems` (`productId`,`storeId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `orders` (`userId`);--> statement-breakpoint
CREATE INDEX `storeIdx` ON `orders` (`storeId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `orders` (`status`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `shoppingCarts` (`userId`);--> statement-breakpoint
CREATE INDEX `statusIdx` ON `shoppingCarts` (`status`);--> statement-breakpoint
CREATE INDEX `listIdx` ON `shoppingListItems` (`listId`);--> statement-breakpoint
CREATE INDEX `userIdx` ON `shoppingLists` (`userId`);