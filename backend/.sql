CREATE TABLE IF NOT EXISTS `todoapp`.`todo` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `task_name` VARCHAR(50) NULL DEFAULT NULL,
  `priority_id` TINYINT(4) NULL DEFAULT NULL,
  `due_date` DATETIME NULL DEFAULT NULL,
  `image_key` VARCHAR(50) NULL DEFAULT NULL,
  `image_data` LONGTEXT NULL DEFAULT NULL,
  `status_id` TINYINT(4) NULL DEFAULT '0',
  PRIMARY KEY (`id`));
  
CREATE TABLE IF NOT EXISTS `todoapp`.`subtodo` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `todo_id` INT(11) NOT NULL,
  `task_name` VARCHAR(50) NULL DEFAULT NULL,
  `status_id` TINYINT(4) NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subtodo_todo1`
    FOREIGN KEY (`todo_id`)
    REFERENCES `todoapp`.`todo` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION);
    
CREATE TABLE IF NOT EXISTS `todoapp`.`priority` (
  `id` TINYINT(4) NOT NULL,
  `priority` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`));
  
CREATE TABLE IF NOT EXISTS `todoapp`.`status` (
  `id` TINYINT(4) NOT NULL,
  `status` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`id`));
  
INSERT INTO STATUS (id, status) values (0, 'Pending');
INSERT INTO STATUS (id, status) values (1, 'Completed');

INSERT INTO PRIORITY (id, priority) values (0, 'Low');
INSERT INTO PRIORITY (id, priority) values (1, 'Medium');
INSERT INTO PRIORITY (id, priority) values (2, 'High');