"use client";

import { useEffect } from "react";

const BootstrapClient = () => {
  useEffect(() => {
    // 動態引入 Bootstrap JavaScript
    const importBootstrap = async () => {
      if (typeof window !== "undefined") {
        // 引入 Bootstrap JS
        await import("bootstrap/dist/js/bootstrap.bundle.min.js");
      }
    };

    importBootstrap();
  }, []);

  return null;
};

export default BootstrapClient;