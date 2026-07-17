CREATE DATABASE  IF NOT EXISTS `gestreunion` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `gestreunion`;
-- MySQL dump 10.13  Distrib 8.0.43, for Win64 (x86_64)
--
-- Host: localhost    Database: gestreunion
-- ------------------------------------------------------
-- Server version	9.4.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `convoquer_externe`
--

DROP TABLE IF EXISTS `convoquer_externe`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `convoquer_externe` (
  `id_reunion` int NOT NULL,
  `id_personne` int NOT NULL,
  PRIMARY KEY (`id_reunion`,`id_personne`),
  KEY `frk_id_personne` (`id_personne`),
  CONSTRAINT `frk_id_personne` FOREIGN KEY (`id_personne`) REFERENCES `personneexterne` (`id_personne`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `convoquer_interne`
--

DROP TABLE IF EXISTS `convoquer_interne`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `convoquer_interne` (
  `id_utilisateur` int NOT NULL,
  `id_reunion` int NOT NULL,
  `role_reunion` enum('ORGANISATEUR','PARTICIPANT') DEFAULT 'PARTICIPANT',
  PRIMARY KEY (`id_utilisateur`,`id_reunion`),
  KEY `frk_id_reunion` (`id_reunion`),
  CONSTRAINT `frk_id_reunion` FOREIGN KEY (`id_reunion`) REFERENCES `reunion` (`id_reunion`),
  CONSTRAINT `frk_id_utilisateur` FOREIGN KEY (`id_utilisateur`) REFERENCES `utilisateur` (`id_utilisateur`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `division`
--

DROP TABLE IF EXISTS `division`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `division` (
  `id_division` int NOT NULL AUTO_INCREMENT,
  `nom_division` varchar(40) DEFAULT NULL,
  PRIMARY KEY (`id_division`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `organisme`
--

DROP TABLE IF EXISTS `organisme`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `organisme` (
  `id_organisme` int NOT NULL AUTO_INCREMENT,
  `nom_organisme` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_organisme`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `personneexterne`
--

DROP TABLE IF EXISTS `personneexterne`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `personneexterne` (
  `id_personne` int NOT NULL AUTO_INCREMENT,
  `nom_complet` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `id_organisme` int NOT NULL,
  PRIMARY KEY (`id_personne`),
  KEY `frk_organisme_id_organisme` (`id_organisme`),
  CONSTRAINT `frk_organisme_id_organisme` FOREIGN KEY (`id_organisme`) REFERENCES `organisme` (`id_organisme`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `point`
--

DROP TABLE IF EXISTS `point`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `point` (
  `id_point` int NOT NULL AUTO_INCREMENT,
  `description` text,
  `est_discute` tinyint(1) DEFAULT NULL,
  `id_reunion` int NOT NULL,
  PRIMARY KEY (`id_point`),
  KEY `frk_reunion_id_reunion` (`id_reunion`),
  CONSTRAINT `frk_reunion_id_reunion` FOREIGN KEY (`id_reunion`) REFERENCES `reunion` (`id_reunion`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `reunion`
--

DROP TABLE IF EXISTS `reunion`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `reunion` (
  `id_reunion` int NOT NULL AUTO_INCREMENT,
  `titre` varchar(200) DEFAULT NULL,
  `date_reunion` date DEFAULT NULL,
  `heure_debut` time DEFAULT NULL,
  `heure_fin_prevue` time DEFAULT NULL,
  `heure_fin_reelle` time DEFAULT NULL,
  `id_salle` int NOT NULL,
  `pv_rapport` blob,
  PRIMARY KEY (`id_reunion`),
  KEY `frk_salle_id_salle` (`id_salle`),
  CONSTRAINT `frk_salle_id_salle` FOREIGN KEY (`id_salle`) REFERENCES `salle` (`id_salle`)
) ENGINE=InnoDB AUTO_INCREMENT=24 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `salle`
--

DROP TABLE IF EXISTS `salle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salle` (
  `id_salle` int NOT NULL AUTO_INCREMENT,
  `nom_salle` varchar(35) DEFAULT NULL,
  `capacite` int DEFAULT NULL,
  PRIMARY KEY (`id_salle`),
  UNIQUE KEY `nom_salle` (`nom_salle`),
  UNIQUE KEY `nom_salle_2` (`nom_salle`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `service`
--

DROP TABLE IF EXISTS `service`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `service` (
  `id_service` int NOT NULL AUTO_INCREMENT,
  `nom_service` varchar(40) DEFAULT NULL,
  `id_division` int NOT NULL,
  PRIMARY KEY (`id_service`),
  KEY `frk_division_id_division` (`id_division`),
  CONSTRAINT `frk_division_id_division` FOREIGN KEY (`id_division`) REFERENCES `division` (`id_division`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Table structure for table `utilisateur`
--

DROP TABLE IF EXISTS `utilisateur`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `utilisateur` (
  `id_utilisateur` int NOT NULL AUTO_INCREMENT,
  `nom` varchar(50) DEFAULT NULL,
  `prenom` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `mot_de_passe` varchar(255) DEFAULT NULL,
  `role` enum('User','Admin') DEFAULT 'User',
  `id_service` int NOT NULL,
  PRIMARY KEY (`id_utilisateur`),
  KEY `frk_service_id_service` (`id_service`),
  CONSTRAINT `frk_service_id_service` FOREIGN KEY (`id_service`) REFERENCES `service` (`id_service`)
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-17 11:23:44
