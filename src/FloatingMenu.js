import React, { useState, useCallback } from "react";
import { Plus, XCircle, Grid, Link as LinkIcon } from "lucide-react";
import "./App.css";

const FloatingMenu = ({ onAddGroup, onAddConnection }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const handleAddGroup = useCallback(() => {
    onAddGroup();
    setIsOpen(false);
  }, [onAddGroup]);

  const handleAddConnection = useCallback(() => {
    onAddConnection();
    setIsOpen(false);
  }, [onAddConnection]);

  return (
    <div className="floating-menu-wrapper">
      {isOpen && (
        <div className="floating-menu-options">
          <button onClick={handleAddGroup} className="floating-menu-button">
            <Grid className="h-5 w-5" />
            <span className="floating-menu-tooltip">Add Group</span>
          </button>
          <button
            onClick={handleAddConnection}
            className="floating-menu-button"
          >
            <LinkIcon className="h-5 w-5" />
            <span className="floating-menu-tooltip">Add Connection</span>
          </button>
        </div>
      )}
      <button onClick={toggleMenu} className="floating-menu-toggle">
        {isOpen ? (
          <XCircle className="h-8 w-8" />
        ) : (
          <Plus className="h-8 w-8" />
        )}
      </button>
    </div>
  );
};

export default FloatingMenu;
