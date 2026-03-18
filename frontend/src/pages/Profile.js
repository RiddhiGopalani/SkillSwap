import { useState } from "react";

function Profile() {
  const [teach, setTeach] = useState("");
  const [learn, setLearn] = useState("");
  const [level, setLevel] = useState("");
  const [urgency, setUrgency] = useState("");

  const handleSubmit = () => {
    console.log({
      teach,
      learn,
      level,
      urgency,
    });

    alert("Profile Saved!");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "40px" }}>
      <h2>Profile Setup</h2>

      <h3>Teach</h3>
      <select onChange={(e) => setTeach(e.target.value)}>
        <option value="">Select topic</option>
        <option>Python</option>
        <option>DBMS</option>
        <option>DSA</option>
        <option>Canva</option>
      </select>

      <br /><br />

      <h3>Learn</h3>
      <select onChange={(e) => setLearn(e.target.value)}>
        <option value="">Select topic</option>
        <option>Python</option>
        <option>DBMS</option>
        <option>DSA</option>
        <option>Resume Building</option>
      </select>

      <br /><br />

      <h3>Your Level</h3>
      <select onChange={(e) => setLevel(e.target.value)}>
        <option value="">Select level</option>
        <option>Beginner</option>
        <option>Intermediate</option>
        <option>Advanced</option>
      </select>

      <br /><br />

      <h3>Urgency</h3>
      <select onChange={(e) => setUrgency(e.target.value)}>
        <option value="">Select urgency</option>
        <option>Urgent</option>
        <option>Moderate</option>
        <option>Casual</option>
      </select>

      <br /><br />

      <button onClick={handleSubmit}>Save Profile</button>
    </div>
  );
}

export default Profile;