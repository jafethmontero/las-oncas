import { useEffect } from "react";
import "./App.css";
import LeafletTracking from "./Map";

function App() {
  const API_URL = import.meta.env.VITE_NETLIFY_FUNCTION_URL;
  const API_KEY = import.meta.env.VITE_SECRET_API_KEY;

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "x-api-key": API_KEY,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log(data);
    }

    fetchData();
  }, [API_URL, API_KEY]);

  return <LeafletTracking />;
}

export default App;
