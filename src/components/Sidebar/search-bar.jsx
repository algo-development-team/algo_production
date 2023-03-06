import { useState, useEffect, useRef } from "react";
import { Draggable } from "@fullcalendar/interaction";
import { useExternalEventsContextValue } from "context";

export const SearchBar = ({ tasks }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const { externalEventsRef } = useExternalEventsContextValue();
  const resultsContainerRef = useRef(null);
  const [useeffectusedonce, setUseeffectusedonce] = useState(false);

  useEffect(() => {
    // if (searchResults.length === 0 && useeffectusedonce) {
    //   resultsContainerRef.current.innerHTML = "";}
    if (searchResults.length === 0 && useeffectusedonce) {
      resultsContainerRef.current.innerHTML = "";}
    // if (resultsContainerRef.current && searchResults.length > 0) {
    //   resultsContainerRef.current.innerHTML = "";}
    if (resultsContainerRef.current && searchResults.length > 0) {
      resultsContainerRef.current.innerHTML = "";}
      setUseeffectusedonce(true);
      searchResults.forEach((result) => {
        const eventEl = document.createElement("div");
        eventEl.style.padding = "10px";
        eventEl.style.borderRadius = "5px";
        eventEl.style.border = "1px solid #0074D9";
        eventEl.style.boxShadow = "0 2px 5px rgba(0, 0, 0, 0.3)";
        eventEl.style.fontSize = "16px";
        eventEl.style.margin = "5px 0";
        eventEl.style.color = "#fff";
        eventEl.style.backgroundColor = "#0074D9";
        eventEl.style.cursor = "pointer";

        eventEl.innerText = result;

        new Draggable(eventEl, {
          eventData: function () {
            return {
              title: result,
            };
          },
        });

        resultsContainerRef.current.appendChild(eventEl);
      });
  }, [searchResults]);

  const handleChange = (event) => {
    const newSearchTerm = event.target.value.toLowerCase();
    setSearchTerm(newSearchTerm);

    const filteredResults = tasks.filter((task) =>
      task.toLowerCase().includes(newSearchTerm)
    );

    setSearchResults(filteredResults);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <div style={{ position: "relative" }}>
        <img
          src="xxx"
          alt="Search Icon"
          style={{
            position: "absolute",
            left: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "20px",
            height: "20px",
          }}
        />
        <input
          type="text"
          style={{
            padding: "10px 10px 10px 35px",
            borderRadius: "5px",
            border: "none",
            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.3)",
            fontSize: "16px",
            outline: "none",
            width: "100%",
            maxWidth: "400px",
            boxSizing: "border-box",
          }}
          onChange={handleChange}
          value={searchTerm}
        />
      </div>

      {searchTerm !== "" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "10px",
            maxHeight: "300px",
            overflowY: "scroll",
          }}
          ref={resultsContainerRef}
        >
          {searchResults.length === 0 ? (
            <div>No such task exists</div>
          ) : null}

        </div>
      )}
      {searchTerm === "" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "10px",
            maxHeight: "300px",
            overflowY: "scroll",
          }}
          ref={resultsContainerRef}
        >
        </div>
      )}
      {/* {searchTerm !== "" && (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
            marginTop: "10px",
            maxHeight: "300px",
            overflowY: "scroll",
          }}
          ref={resultsContainerRef}
        >
          {searchResults.length === 0 ? (
            <div>No such task exists</div>
          ) : null}

        </div>
      )} */}
    </div>
  );
};