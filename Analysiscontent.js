import React, { createContext, useState } from "react";

export const AnalysisContext = createContext();

export function AnalysisProvider({ children }) {
  const [analysisState, setAnalysisState] = useState({
    file: null,
    responseMessage: "",
    preview: null,
    extractedText: null,
    prediction: null,
  });

  return (
    <AnalysisContext.Provider value={{ analysisState, setAnalysisState }}>
      {children}
    </AnalysisContext.Provider>
  );
}
