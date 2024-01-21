import { useState, useRef } from 'react';
import logo from './logo.svg';
import './App.css';
import dayjs, { Dayjs } from 'dayjs';
import { TextField, Button, Container, Stack, Date, TextareaAutosize } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import SignatureCanvas from 'react-signature-canvas'


const handleEmployeeChange = (e, id, employees, setFormData) => {
  e.preventDefault();
  console.log(e)
  const { name, value } = e.target;
  console.log(name)
  console.log(value)
  const newEmployees = employees.map((employee) => {
    if (employee.id === id) {
      return {
        ...employee,
        [name]: value,
      };
    }
    return employee;
  });
  setFormData((prevFormData) => ({
    ...prevFormData,
    employees: newEmployees,
  }));
  console.log(employees)
};

const CustomTableCellText = ({ id, column, employees, setFormData, size }) => {
  console.log(employees)
  const width = size === 'small' ? '50px' : '200px'
  const employee = employees.find((employee) => employee.id === id);
  return (
    <TableCell>
      <TextField
        type="text"
        variant="outlined"
        color="secondary"
        name={column}
        value={employee[column]}
        onChange={(e) => handleEmployeeChange(e, employee.id, employees, setFormData)}
        fullWidth
        style={{ width }}
      />
    </TableCell>
  );
};

const CustomTableCellTime = ({ id, column, employees, setFormData }) => {
  console.log(employees)
  const employee = employees.find((employee) => employee.id === id);
  return (
    <TableCell>
      <TextField
        type="time"
        vairant="outlined"
        color="secondary"
        name={column}
        value={employee[column]}
        onChange={(e) => handleEmployeeChange(e, employee.id, employees, setFormData)}
        fullWidth
        style={{ width: '135px' }}
      />
    </TableCell>
  )
}

const addEmployee = (employees, setFormData) => {
  const newEmployees = [...employees];
  newEmployees.push({
    id: employees.length,
    name: "",
    startTime: "",
    endTime: "",
    flaggerInitials: "",
    clientInitials: "",
  });
  setFormData((prevFormData) => ({
    ...prevFormData,
    employees: newEmployees,
  }));
}

const removeEmployee = (employees, setFormData) => {
  const newEmployees = [...employees];
  newEmployees.pop();
  setFormData((prevFormData) => ({
    ...prevFormData,
    employees: newEmployees,
  }));
}



const EmployeeTable = ({employees, setFormData}) => {
  return (
    <>
      <Table className="table">
        {/* <caption>Employee Information</caption> */}
        <TableHead>
          <TableRow>
            <TableCell>Name</TableCell>
            <TableCell>Start Time</TableCell>
            <TableCell>End Time</TableCell>
            <TableCell>Flagger Initials</TableCell>
            <TableCell>Client Initials</TableCell>
          </TableRow>
          {/* for each employee in employees create a row */}
          {employees.map((employee) => (
            <TableRow>
              <CustomTableCellText id={employee.id} column="name" employees={employees} setFormData={setFormData} />
              <CustomTableCellTime id={employee.id} column="startTime" employees={employees} setFormData={setFormData} />
              <CustomTableCellTime id={employee.id} column="endTime" employees={employees} setFormData={setFormData} />
              <CustomTableCellText id={employee.id} column="flaggerInitials" employees={employees} setFormData={setFormData} size="small" />
              <CustomTableCellText id={employee.id} column="clientInitials" employees={employees} setFormData={setFormData} size="small" />
            </TableRow>
          ))}
        </TableHead>
      </Table>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => addEmployee(employees, setFormData)}>Add Employee</Button>
        <Button onClick={() => removeEmployee(employees, setFormData)} style={{ marginLeft: '10px' }}>Remove Employee</Button>
      </div>
    </>
  )
}

const App = () => {
  const clientSig = useRef();
  const supervisorSig = useRef();
  const [formData, setFormData] = useState({
    teamLead: "",
    teamLeadNumber: "",
    streetAddress: "",
    cityAddress: "",
    date: "",
    day: "",
    license: "",
    job: "",
    maximo: "",
    equipment: "",
    qty: "",
    dailyWeekly: "",
    employees: [
      {
        id: 0,
        name: "",
        startTime: "",
        endTime: "",
        flaggerInitials: "",
        clientInitials: "",
      },
      {
        id: 1,
        name: "",
        startTime: "",
        endTime: "",
        flaggerInitials: "",
        clientInitials: "",
      },
      {
        id: 2,
        name: "",
        startTime: "",
        endTime: "",
        flaggerInitials: "",
        clientInitials: "",
      }
    ],
    comment: "",
    clientName: "",
    supervisorName: "",
    clientSignature: null,
    supervisorSignature: null,
  });

  // const

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(name)
    console.log(value)
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(JSON.stringify(formData));
    // update state to have date be of the form MM-DD-YYYY
    const date = formData.date;
    const formattedDate = dayjs(date).format('MM-DD-YYYY');
    setFormData((prevFormData) => ({
      ...prevFormData,
      date: formattedDate,
    }));
    // determine day from date
    const day = dayjs(date).format('dddd');
    setFormData((prevFormData) => ({
      ...prevFormData,
      day,
    }));
    // console.log(formData)

    // send to local api at port 3001
    fetch('http://localhost:3001/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err))
  };

  const handleSignatureEnd = (sigRef) => {
    const key = sigRef === clientSig ? 'clientSignature' : 'supervisorSignature'
    return () => {
      setFormData((prevFormData) => ({
        ...prevFormData,
        [key]: sigRef.current.toDataURL()
      }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <header>
        {/* <img src="logo.png" alt="My logo" class="logo" />
        <div class="team-lead"></div> */}
      </header>
      <main>
        {/* <div class="title">
          <h1>FLAGGING BILLING/INFORMATION SHEET</h1>
          <h3>*Please complete <i>ALL JOB</i> INFO</h3>
        </div> */}
        <section className='team-lead'>
          <TextField
            type="text"
            vairant="outlined"
            color="secondary"
            label="Team Lead"
            name="teamLead"
            value={formData.teamLead}
            onChange={handleInputChange}
            fullWidth
            required
          />
          <TextField
            type="text"
            vairant="outlined"
            color="secondary"
            label="Team Lead Phone Number"
            name="teamLeadNumber"
            value={formData.teamLeadNumber}
            onChange={handleInputChange}
            fullWidth
            required
          />
        </section>
        <section class="sec">
          <h3 class="section-title">S.E.C.</h3>
          <Stack spacing={2} direction="row" sx={{marginBottom: 4}}>
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="Street Address"
              name="streetAddress"
              value={formData.streetAddress}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="City"
              name="cityAddress"
              value={formData.cityAddress}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{marginBottom: 4}}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                label="Date Work Performed"
                value={formData.date}
                onChange={(newValue) => {
                  setFormData((prevFormData) => ({
                    ...prevFormData,
                    date: newValue,
                  }));
                }
                }
                slotProps={{
                  textField: {
                    // size: "small",
                    error: false,
                  },
                }}
                // color="secondary"
              />
            </LocalizationProvider>
            {/* <label for="day">Day Work Performed:</label>
            <input type="text" id="day" name="day" required /><br /> */}
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="License #"
              name="license"
              value={formData.license}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Stack>
          <Stack spacing={2} direction="row" sx={{marginBottom: 4}}>
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="Job #"
              name="job"
              value={formData.job}
              onChange={handleInputChange}
              fullWidth
              required
            />

            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="Maximo #"
              name="maximo"
              value={formData.maximo}
              onChange={handleInputChange}
              fullWidth
              required
            />
          </Stack>
        </section>
        <section class="equipment">
          <h3 class="section-title">ADDITIONAL EQUIPMENT NEEDED</h3>
          <div class="content">
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="EQUIPMENT NAME"
              name="equipment"
              value={formData.equipment}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="QTY"
              name="qty"
              value={formData.qty}
              onChange={handleInputChange}
              fullWidth
            />
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="DAILY/WKLY"
              name="dailyWeekly"
              value={formData.dailyWeekly}
              onChange={handleInputChange}
              fullWidth
            />
          </div>
        </section>
        <section class="employees">
          <EmployeeTable employees={formData.employees} setFormData={setFormData}/>
        </section>
        <section class="comments">
          <p>Comment(s):</p>
          <TextareaAutosize
            minRows={3}
            placeholder="Enter your comment here"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            style={{ width: "100%" }}
          />
        </section>
        <p id='notice'><b>**By signing below, you are agreeing to the above billing hours. Contact your immediate supervisor with any concerns.**</b></p>
        <section className="signatures">
          <div id="client">
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="Foreman/Client Name"
              name="clientName"
              value={formData.clientName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <SignatureCanvas
              penColor='black'
              canvasProps={{ width: 200, height: 100, className: 'sigCanvas' }}
              ref={clientSig}
              onEnd={handleSignatureEnd(clientSig)}
            />
          </div>
          <div id='supervisor'>
            <TextField
              type="text"
              vairant="outlined"
              color="secondary"
              label="Supervisor Name"
              name="supervisorName"
              value={formData.supervisorName}
              onChange={handleInputChange}
              fullWidth
              required
            />
            <SignatureCanvas
              penColor='black'
              canvasProps={{ width: 200, height: 100, className: 'sigCanvas' }}
              ref={supervisorSig}
              onEnd={handleSignatureEnd(supervisorSig)}
            />
          </div>
        </section>
        <section className="submit">
          <Button type="submit" variant="contained" color="primary">Submit Billing Sheet</Button>
        </section>
      </main>
    </form>
  );
}

export default App;
