
import React, { useState, useRef, useEffect, useCallback, forwardRef } from 'react';
import { Alert as MuiAlert, Typography, Container, Button, TextField, Snackbar } from '@mui/material'; //Grid, Box, ButtonGroup, createTheme, ThemeProvider, colors, 
import { DataGrid } from '@mui/x-data-grid';

import { Axios } from '../api';

export default function Admin() {
    const setHash = JSON.stringify((window.location.hash).substring(1));
    const axiosPassRef = useRef(setHash);
    const setAuth = () => {
        return ({ 'Authorization': axiosPassRef.current.value || (window.location.hash).substring(1) });
    }


    const Alert = forwardRef((props, ref) => {
        return <MuiAlert elevation={6} ref={ref} variant="filled" {...props} />;
    });

    const [error, setError] = React.useState(false);

    const handleError = () => {
        setError(true);
    }

    const [showSecret, setShowSecret] = useState(true);

    const [teamListData, setTeamListData] = useState([]);
    const [selectedTeamID, setSelectedTeamID] = useState("");

    const [taskListData, setTaskListData] = useState([]);

    const [teamTaskListData, setTeamTaskListData] = useState([]);

    const refNewValue = useRef("");

    useEffect(() => {
        loadTeamsData();
        loadTasksData();
        axiosPassRef.current.value = window.location.hash;
        window.location.hash = '';
    }, []);

    const getSelectedTeam_Name = (selectedTeamID) => {
        if (selectedTeamID && teamListData != []) {
            const team = teamListData?.find((x) => x._id == selectedTeamID);
            return <>{team?.team_id} <br /> {team.members}</>;
        }
        return 'null'
    };


    const render = () => (<>
        <Container maxWidth="md" sx={{ marginY: 1 }}>
            <h1>Admin</h1>
            <Snackbar open={error} autoHideDuration={6000} onClose={(event, reason) => { if (reason === 'clickaway') return; setError(false); }}>
                <Alert onClose={() => { (event, reason) => { if (reason === 'clickaway') return; setError(false); } }} severity="error" sx={{ width: '100%' }}>
                    Axios Fail
                </Alert>
            </Snackbar>



            <Typography align={'center'} sx={{ m: 2 }}>
                <TextField inputRef={axiosPassRef} type="password" label="Password" variant="standard" />
                <Button variant="outlined" sx={{ m: 1 }}
                    onClick={async () => {
                        await loadTasksData();
                        await loadTeamsData();
                    }}
                >
                    Reload
                </Button>
            </Typography>

            <Typography marginBottom={1} variant="h2" component="h2">Team List</Typography>
            <Typography align={'right'} sx={{ m: 2 }}>
                <Button variant="outlined" sx={{ m: 1 }}
                    onClick={async () => {
                        try {
                            const result = await Axios(
                                'POST'
                                , 'api/teams'
                                , {}
                                , { ...setAuth() }
                            );
                            console.log(result);
                            if (result) {
                                await loadTeamsData();
                            }
                        } catch (e) { handleError(); }
                    }}
                >
                    + Add Team
                </Button>
                <Button variant="outlined" sx={{ m: 1 }} onClick={() => { setShowSecret(!showSecret) }}> {!showSecret ? '-' : ''} Secret</Button>
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={teamListData}
                    columns={columnsTeamList}
                    getRowId={(row) => row._id}
                    onCellEditCommit={handleRowEditCommit_TeamList}
                    onRowClick={async (rows) => {
                        await (async () => { setSelectedTeamID(rows.id); })()
                        await loadTeamTasksData(rows.id, teamListData, taskListData);
                    }}
                    onCellEditStop={async (a, b) => {

                        const previous_value = a.value;
                        const set_id = a.id;
                        const new_value = refNewValue.current;
                        const data = { team_id: set_id, members: new_value }

                        try {
                            if (new_value == "false") throw new Error();
                            if (previous_value != new_value) {
                                const result = await Axios(
                                    'PATCH'
                                    , 'api/teams'
                                    , data
                                    , { ...setAuth() }
                                );
                                await loadTeamsData();
                            }
                        } catch (e) { handleError(); }
                    }}
                />
            </div>




            <Typography marginBottom={1} variant="h3" component="h3"> Team: {getSelectedTeam_Name(selectedTeamID)} </Typography>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={teamTaskListData}
                    columns={columns_TeamTaskList}
                    sortModel={   { field: 'title', sort: 'asc', }}
                    getRowId={(row) => row._id}
                    disableSelectionOnClick
                    onCellEditCommit={handleRowEditCommit_Team_Task_List}
                    onCellEditStop={async (a, b) => { }}
                />
            </div>



            <br /><br /><br />

            <Typography marginBottom={1} variant="h2" component="h2">All Task List</Typography>
            <Typography align={'right'} sx={{ m: 2 }}>
                <Button variant="outlined" sx={{ m: 1 }}
                    onClick={async () => {
                        try {
                            const result = await Axios(
                                'POST'
                                , 'api/tasks'
                                , {}
                                , { ...setAuth() }
                            );
                            if (result) {
                                await loadTasksData();
                                await loadTeamsData();
                            }
                        } catch (e) { handleError(); }
                    }}
                >
                    + Add Task
                </Button>
            </Typography>
            <div style={{ height: 400, width: "100%" }}>
                <DataGrid
                    rows={taskListData}
                    columns={columnsTaskList}
                    getRowId={(row) => row._id}
                    disableSelectionOnClick
                    onCellEditCommit={handleRowEditCommit_TaskList}
                    onCellEditStop={async (a, b) => {
                        const previous_value = a.value;
                        const set_id = a.id;
                        const new_value = refNewValue.current;
                        const data = { task_id: set_id, title: new_value }
                        try {
                            if (new_value == "false") throw new Error();
                            if (previous_value != new_value) {
                                const result = await Axios(
                                    'PATCH'
                                    , 'api/tasks'
                                    , data
                                    , { ...setAuth() }
                                );
                                loadTasksData();
                            }
                        } catch (e) { handleError(); }
                    }}
                />
            </div>





        </Container >

    </>);


    const loadTeamsData = async () => {
        try {
            const result = await Axios(
                'GET'
                , 'api/teams'
                , {}
                , { ...setAuth() }
            );

            setTeamListData(result);

            return result;
        } catch (e) { handleError(); }
    };



    const loadTasksData = async () => {
        try {
            const result = await Axios(
                'GET'
                , 'api/tasks'
                , {}
                , { ...setAuth() }
            );

            setTaskListData(result);
            await loadTeamTasksData(selectedTeamID, teamListData, result);

        } catch (e) { handleError(); }
    };


    const columns_TeamTaskList = [
        { field: "approved", headerName: "approved", width: 70, type: 'boolean', description: "Approved Area" }
        , { field: "selected", headerName: "selected", width: 70, type: 'boolean', editable: true, description: "Selected Area" }
        , { field: "task_id", headerName: "Task#", width: 80, description: "Task id" }
        , {
            field: "title", headerName: "Task Title", flex: 1, align: "left", description: "Task members list"
            , renderCell: (rowCell) => (
                <div onClick={(p, e) => { }} style={{ color: "blue", fontSize: 18, width: "100%", textAlign: "left" }}> {rowCell.value} </div>)
            //, valueGetter: (params) => { return `${params.getValue(params.id, "image") || ""} ${ params.getValue(params.id, "title") || "" }`;}/
        },
        { field: "mark", headerName: "Mark", width: 80, description: "Task id", editable: true, sortable: false }
    ];

    const columnsTeamList = [
        { field: "team_id", headerName: "Team#", width: 80, description: "Team id" }
        , {
            field: "members", headerName: "Member List", flex: 1, align: "left", description: "Team members list"
            , editable: true
            , sortable: false
            , renderCell: (rowCell) => (
                <div onClick={(p, e) => { }} style={{ color: "blue", fontSize: 18, width: "100%", textAlign: "left" }}> {rowCell.value} </div>)
            //, valueGetter: (params) => { return `${params.getValue(params.id, "image") || ""} ${ params.getValue(params.id, "title") || "" }`;}/
        }
        , {
            field: "total_mark", headerName: "Total Marks", type: "number", width: 90, align: "center"
        }
        , { field: "secret_key", headerName: "secret key", width: 80, description: "Team Secret Key", hide: showSecret }
    ];

    const columnsTaskList = [
        { field: "task_id", headerName: "Task#", width: 80, description: "Task id" }
        , {
            field: "title", headerName: "Task Title", flex: 1, align: "left", description: "Task members list"
            , editable: true
            , sortable: false
            , renderCell: (rowCell) => (
                <div onClick={(p, e) => { }} style={{ color: "blue", fontSize: 18, width: "100%", textAlign: "left" }}> {rowCell.value} </div>)
            //, valueGetter: (params) => { return `${params.getValue(params.id, "image") || ""} ${ params.getValue(params.id, "title") || "" }`;}/
        }
    ];




    const loadTeamTasksData = async (selectedTeamID, teamListData, taskListData) => {
        if (selectedTeamID && teamListData != []) {
            try {
                const team = JSON.parse(JSON.stringify(teamListData?.find((x) => x._id == selectedTeamID)));
                const tasks = JSON.parse(JSON.stringify(taskListData));
                const teamTaskList = [];
                const data = tasks.map((task) => {
                    let approved = false, selected = false, _id = task._id, task_id = task.task_id, title = task.title, mark = 0;
                    team.marks.map((x) => {
                        if (x.task_id == _id) {
                            mark = x.mark;
                            approved = true;
                            selected = x.selected;
                        }
                    });
                    teamTaskList.push({ _id, title, mark, approved, selected });
                    return { _id, task_id, title, mark, approved, selected };
                });
                setTeamTaskListData(data);
            } catch (e) { handleError(); }
        }

    }




    const handleRowEditCommit_Team_Task_List =
        async (params) => {
            const { id, field: key, value } = params;
            try {
                console.log('selectedTeamID', selectedTeamID);
                console.log('selectedTeamID', key);
                console.log(selectedTeamID !== '' && (key === "selected" || key === "mark"));
                if (key === "selected" || key === "mark") {

                    const data = key === "selected"
                        ? { team_id: selectedTeamID, task_id: id, select: value }
                        : { team_id: selectedTeamID, task_id: id, mark: value };


                    console.log('data', data);
                    const result = await Axios(
                        'PATCH'
                        , 'api/teams'
                        , data
                        , { ...setAuth() }
                    );
                    if (!result) throw new Error();
                    ;
                    await loadTeamTasksData(selectedTeamID, await loadTeamsData(), taskListData);

                } else throw new Error();

            } catch (e) { handleError(); return false; }
        };


    const handleRowEditCommit_TeamList = useCallback(
        (params) => {
            const { id, field: key, value } = params;
            if (key == "members")
                refNewValue.current = params.value;
            else refNewValue.current = "false";
        }, []
    );

    const handleRowEditCommit_TaskList = useCallback(
        (params) => {
            const { id, field: key, value } = params;
            if (key == "title")
                refNewValue.current = params.value;
            else refNewValue.current = "false";
        }, []
    );



    return render();
}

/*

function MuiStyle(props) {
    const theme = createTheme({
        palette: {
            primary: {
                main: '#FFA500'
            },
            secondary: {
                main: colors.blue[400]
            }
        }
        , typography: {
            h2: {
                fontSize: 24,
                marginBottom: 1
            }
            , body2: {
                color: colors.deepPurple[500]
            }
        }


    });
    return (<ThemeProvider theme={theme}>
        {props.children}
    </ThemeProvider>);
}*/