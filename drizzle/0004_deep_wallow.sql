CREATE TABLE `competitions_images` (
	`id` varchar(36) NOT NULL,
	`image_path` text NOT NULL,
	`competition_id` varchar(36) NOT NULL,
	CONSTRAINT `competitions_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `slider_images` (
	`id` varchar(36) NOT NULL,
	`slider_id` varchar(36) NOT NULL,
	`image_path` text NOT NULL,
	CONSTRAINT `slider_images_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sliders` (
	`id` varchar(36) NOT NULL,
	`name` varchar(255),
	`status` boolean DEFAULT true,
	`arrange` int NOT NULL,
	CONSTRAINT `sliders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `competitions` ADD `main_image_path` text NOT NULL;--> statement-breakpoint
ALTER TABLE `complaints` ADD `date` date NOT NULL;--> statement-breakpoint
ALTER TABLE `complaints` ADD `status` boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE `complaints_category` ADD `description` text NOT NULL;--> statement-breakpoint
ALTER TABLE `popups_images` ADD `title` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_competition` ADD `date_of_birth` date NOT NULL;--> statement-breakpoint
ALTER TABLE `user_competition` ADD `name` varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE `user_competition` ADD `gender` enum('male','female') NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `rejection_reason` text;--> statement-breakpoint
ALTER TABLE `votes` ADD `start_date` date NOT NULL;--> statement-breakpoint
ALTER TABLE `votes` ADD `end_date` date NOT NULL;--> statement-breakpoint
ALTER TABLE `competitions_images` ADD CONSTRAINT `competitions_images_competition_id_competitions_id_fk` FOREIGN KEY (`competition_id`) REFERENCES `competitions`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `slider_images` ADD CONSTRAINT `slider_images_slider_id_sliders_id_fk` FOREIGN KEY (`slider_id`) REFERENCES `sliders`(`id`) ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `user_competition` DROP COLUMN `date`;