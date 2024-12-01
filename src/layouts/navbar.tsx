/**
 * @file Navbar.tsx
 * @description Main navigation component for the iBird application that provides access to
 * core functionalities including wallet connection, trading, and analytics.
 */

import React, { useState, useEffect } from "react";

import { useNavigate } from "react-router-dom";

import Modal from "../common/modal";
import { RiMoneyDollarCircleLine } from "react-icons/ri";
import { IoAnalyticsOutline } from "react-icons/io5";
import { BsLightningCharge } from "react-icons/bs";
import DarkModeToggle from "./DarkModeToggle";
import useGetAnalyticsData from "../hooks/use_get_analytics_data";
import Wallet from "../wallet/wallet";

/**
 * @component Navbar
 * @description Primary navigation component that renders the application header with logo,
 * version indicator, and interactive modal controls for various features.
 */
const Navbar: React.FC = () => {
  const navigate = useNavigate();

  /**
   * Modal state management for the main wallet connection
   */
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => {
    closeAllModals();
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
  };

  /**
   * Modal state management for the trading interface
   */
  const [isTradeModalOpen, setIsTradeModalOpen] = useState(false);
  const openTradeModal = () => {
    closeAllModals();
    setIsTradeModalOpen(true);
  };
  const closeTradeModal = () => {
    setIsTradeModalOpen(false);
  };

  /**
   * Modal state management for analytics display
   */
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const openAnalyticsModal = () => {
    closeAllModals();
    setIsAnalyticsModalOpen(true);
  };
  const closeAnalyticsModal = () => {
    setIsAnalyticsModalOpen(false);
  };

  /**
   * Modal state management for the main menu
   */
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const openMenuModal = () => {
    closeAllModals();
    setIsMenuModalOpen(true);
  };
  const closeMenuModal = () => {
    setIsMenuModalOpen(false);
  };

  /**
   * Utility function to ensure only one modal is open at a time
   * by closing all modals before opening a new one
   */
  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsTradeModalOpen(false);
    setIsAnalyticsModalOpen(false);
    setIsMenuModalOpen(false);
  };

  /**
   * Fetch analytics data for the specified topic
   */
  const { topicData, loading, error } = useGetAnalyticsData("0.0.6014086");

  return (
    <nav className="py-3 px-6 bg-background">
      {/* Main navigation container */}
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and branding section */}
        <div className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + "/ibird1.png"}
            alt="Logo"
            className="mr-2 w-10 h-auto"
          />
          <h1 className="md:text-lg text-xl mr-3 text-primary font-semibold">
            iBird
          </h1>
          <span className="text-background text-sm bg-gradient-to-r from-primary to-accent rounded p-1">
            v0.0.9
          </span>
        </div>

        {/* Action buttons section */}
        <div className="flex items-center">
          <button
            onClick={openMenuModal}
            className="font-semibold mr-2 text-background bg-primary rounded-xl hover:bg-accent transition duration-300 ml-2 p-0.5"
          >
            <BsLightningCharge className="text-3xl" />
          </button>

          <Wallet />
        </div>

        {/* Modal Components */}
        {/* Trading Modal: Provides links to various trading and asset acquisition options */}
        {isTradeModalOpen && (
          <Modal isOpen={isTradeModalOpen} onClose={closeTradeModal}>
            <div className="text-text bg-background text-center flex flex-col space-y-3 px-12 pb-6 pt-12 rounded-full">
              <a
                href="https://pancakeswap.finance/swap?inputCurrency=BNB&outputCurrency=0x6b471d5ab9f3d92a600e7d49a0b135bf6d4c6a5b"
                className="text-md text-center py-2 px-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get ASSET (BSC)
              </a>
              <a
                href="https://www.saucerswap.finance/swap/HBAR/0.0.1991880"
                className="text-md text-center py-2 px-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get ASSET (HTS)
              </a>
              <a
                href="https://iassets.org/convert"
                className="text-md text-center py-2 px-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Convert BSC to HTS
              </a>
              <a
                href="https://sentx.io/nft-marketplace/0.0.3844404"
                className="text-md text-center py-2 px-3 font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300"
                target="_blank"
                rel="noopener noreferrer"
              >
                Get The First Flight NFTs
              </a>
            </div>
          </Modal>
        )}

        {/* Analytics Modal: Displays platform statistics and metrics */}
        {isAnalyticsModalOpen && (
          <Modal isOpen={isAnalyticsModalOpen} onClose={closeAnalyticsModal}>
            <div className="text-text bg-background text-center flex flex-col space-y-3 px-12 pb-6 pt-12 rounded-full">
              {loading && <p>Loading...</p>}
              {error && <p>Error: {error}</p>}
              {topicData && (
                <>
                  <h2 className="text-2xl font-bold mb-6 text-primary">
                    Overview
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-background text-primary p-6 rounded-lg shadow-2xl shadow-primary transform hover:scale-105 transition duration-300">
                      <h3 className="text-lg font-medium">Total Messages</h3>
                      <p className="text-3xl font-bold">
                        {topicData.totalMessages}
                      </p>
                    </div>
                    <div className="bg-background text-primary p-6 rounded-lg shadow-2xl shadow-primary transform hover:scale-105 transition duration-300">
                      <h3 className="text-lg font-medium">Total Posts</h3>
                      <p className="text-3xl font-bold">
                        {topicData.totalPosts}
                      </p>
                    </div>
                    <div className="bg-background text-primary p-6 rounded-lg shadow-2xl shadow-primary transform hover:scale-105 transition duration-300">
                      <h3 className="text-lg font-medium">Total Threads</h3>
                      <p className="text-3xl font-bold">
                        {topicData.totalThreads}
                      </p>
                    </div>
                    <div className="bg-background text-primary p-6 rounded-lg shadow-2xl shadow-primary transform hover:scale-105 transition duration-300">
                      <h3 className="text-lg font-medium">Total Polls</h3>
                      <p className="text-3xl font-bold">
                        {topicData.totalPolls}
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>
          </Modal>
        )}

        {/* Menu Modal: Contains main navigation options and theme toggle */}
        {isMenuModalOpen && (
          <Modal isOpen={isMenuModalOpen} onClose={closeMenuModal}>
            <div className="text-text bg-background text-center flex flex-col space-y-6 px-12 pb-6 pt-12 rounded-full">
              <button
                onClick={openTradeModal}
                className="flex items-center justify-center font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300 py-2 px-4"
              >
                <RiMoneyDollarCircleLine className="text-3xl mr-2" />
                <span>Trade</span>
              </button>
              <button
                onClick={openAnalyticsModal}
                className="flex items-center justify-center font-semibold text-background bg-primary rounded-xl hover:bg-accent transition duration-300 py-2 px-4"
              >
                <IoAnalyticsOutline className="text-3xl mr-2" />
                <span>Analytics</span>
              </button>
              <DarkModeToggle />
            </div>
          </Modal>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
