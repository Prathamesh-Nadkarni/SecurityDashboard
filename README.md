
# Security Dashboard Setup Instructions

Follow these steps to set up and run the Security Dashboard:

### 1. Install Node.js Dependencies
Navigate to the `security-dashboard` folder and run:

```bash
npm install
```

### 2. Set Up Python Environment
In the base project folder (not inside `security-dashboard`), create and activate a virtual Python environment:

#### a. Create the environment:
```bash
python -m venv env
```

#### b. Activate the environment:
- **For Mac/Linux**:
  ```bash
  source env/bin/activate
  ```
- **For Windows**:
  ```bash
  .\env\Scripts\activate
  ```

### 3. Install Python Dependencies
Once the environment is active, install the required Python packages:

```bash
pip install -r requirements.txt
```

### 4. Run the Backend Server
Start the backend by running:

```bash
python3 app.py
```

### 5. Run the Frontend Development Server
In a separate terminal window, navigate to the `security-dashboard` folder and start the development server:

```bash
npm start dev
```

### 6. Access the Dashboard
Open your browser and navigate to:

```
http://localhost:3000/
```

You should now see the fully functioning security dashboard.


# Changes Implemented
```
Old website: https://github.com/akul-goyal/FrontEnd-Design-Task/tree/master
```

New Features:
1)  Changed UI with a Theme
2)  Role Based Access Control for APIs and UI
3)  Side Bar Navigation
4)  Notifications for new Alerts
5)  On the Go Filters
6)  Table with advanced Filters and Sorting
7)  Paginated Results
8)  Vadlidation and Sanitation of Input Fields
9)  Data Visualization using graphs
10) Network Graph Filters
11) Resolve Alert Feature
12) Admin Access enabled

```