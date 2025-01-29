import React, { useState } from "react";
import * as XLSX from "xlsx";

const SecretSantaApp = () => {
  const [employeeFile, setEmployeeFile] = useState(null);
  const [previousAssignmentsFile, setPreviousAssignmentsFile] = useState(null);
  const [outputData, setOutputData] = useState([]);

  const handleFileUpload = (event, setter) => {
    const file = event.target.files[0];
    if (file) {
      setter(file);
    }
  };

  const processSecretSanta = async () => {
    if (!employeeFile) {
      alert("Please upload the file.");
      return;
    }

    const employees = await readXLSX(employeeFile);
    const previousAssignments = previousAssignmentsFile ? await readXLSX(previousAssignmentsFile) : [];
    const assignments = generateSecretSantaAssignments(employees, previousAssignments);
    setOutputData(assignments);
    exportToXLSX(assignments);
  };

  const readXLSX = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(sheet);
        resolve(json);
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const generateSecretSantaAssignments = (employees, previousAssignments) => {
    let availableReceivers = [...employees];
    let assignments = [];
    
    employees.forEach((giver) => {
      let possibleReceivers = availableReceivers.filter((receiver) => 
        receiver.Employee_EmailID !== giver.Employee_EmailID &&
        !previousAssignments.some(
          (prev) => giver.Employee_EmailID === prev.Employee_EmailID && prev.Secret_Child_EmailID === receiver.Employee_EmailID
        )
      );

      if (possibleReceivers.length === 0) {
        console.log("No Possible Receivers");
        return;
      }
      
      const randomIndex = Math.floor(Math.random() * possibleReceivers.length);
      const chosenReceiver = possibleReceivers[randomIndex];

      assignments.push({
        Employee_Name: giver.Employee_Name,
        Employee_EmailID: giver.Employee_EmailID,
        Secret_Child_Name: chosenReceiver.Employee_Name,
        Secret_Child_EmailID: chosenReceiver.Employee_EmailID,
      });

      availableReceivers = availableReceivers.filter(r => r.Employee_EmailID !== chosenReceiver.Employee_EmailID);
    });
    
    return assignments;
  };

  const exportToXLSX = (data) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Secret Santa Assignments");
    XLSX.writeFile(workbook, "Secret_Santa_Results.xlsx");
  };

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-xl font-bold">Secret Santa Assignment</h1>
      <input className="border p-2 rounded w-full" type="file" accept=".xlsx" onChange={(e) => handleFileUpload(e, setEmployeeFile)} />
      <input className="border p-2 rounded w-full" type="file" accept=".xlsx" onChange={(e) => handleFileUpload(e, setPreviousAssignmentsFile)} />
      <button className="px-4 py-2 bg-blue-500 text-white rounded" onClick={processSecretSanta}>Generate Assignments</button>
    </div>
  );
};

export default SecretSantaApp;
