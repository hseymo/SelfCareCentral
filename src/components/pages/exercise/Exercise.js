import React, { useState, useEffect, useCallback } from 'react';
import './Exercise.css'
import { Link } from 'react-router-dom';
import API from "../../../utils/API.js";
import ExerciseCard from "./ExerciseCard";
import moment from 'moment';

export default function Fitness({ token, weekArray, goalObj, isLoggedIn }) {
    const [Data, setData] = useState({});
    const [thisWeek, setThisWeek] = useState([]);
    const [exerciseFormObject, setExerciseFormObject] = useState({
        date: '',
        activity_type: '',
        activity_duration: '',
        RPE: '',
        notes: ''
    })
    const [updateReq, setUpdateReq] = useState('');
    const [existingItem, setExistingItem] = useState('');
    const [anotherDate, setAnotherDate] = useState('');
    const [anotherWeek, setAnotherWeek] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        // get fitness data for associated user
        API.getUserFitness(token)
        .then((userData) => {
            setData(userData)
            // create empty array
            const fitnessArray = [];
            // weekarray is imported from util and is a m-sun array of the current week's dates. map through the dates
            weekArray.map(entry => {
                // look for equivilant date in response
                var response = userData.find(data => data.date === entry);
                // reformat date to look pretty
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);
                // create new object for each date
                let newObj = { date: dateFormat }
                // if there is no fitness data for date, set status as not reported
                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    // else give the object the keys from the response
                    const { id, date, activity_type, activity_duration, RPE, notes } = response;
                    newObj.id = id
                    newObj.activity_type = activity_type;
                    newObj.activity_duration = activity_duration;
                    newObj.RPE = RPE;
                    newObj.notes = notes;
                }
                // push each object into our array
                fitnessArray.push(newObj)
            })
            // give each array object the day
            fitnessArray[0].day = 'Monday';
            fitnessArray[1].day = 'Tuesday';
            fitnessArray[2].day = 'Wednesday';
            fitnessArray[3].day = 'Thursday';
            fitnessArray[4].day = 'Friday';
            fitnessArray[5].day = 'Saturday';
            fitnessArray[6].day = 'Sunday';
            // set our state with the array
            setThisWeek(fitnessArray)
        })
        .catch((err) => console.log(err))
    }, [token, updateReq])

    useEffect(() => {
        // this triggers when the form's date is changed. get one entry request for matching date
        API.getOneUserFitness(token, exerciseFormObject.date)
        .then((res) => {
            // if there is a response 
            if (res.id) {
                // set the object with the data from the response
                setExerciseFormObject({
                    date: res.date,
                    activity_type: res.activity_type,
                    activity_duration: res.activity_duration,
                    RPE: res.RPE,
                    notes: res.notes
                })
                // change state so we know there is a matching item -> PUT OR DELETE
                setExistingItem(true);
            } else {
                // clear the form from previous data, besides the date
                setExerciseFormObject({
                    date: exerciseFormObject.date,
                    activity_type: '',
                    activity_duration: '',
                    RPE: '',
                    notes: ''
                })
                // change state so we know there is no matching item -> POST
                setExistingItem(false);
            }
        })
        .catch((err) => console.log(err))
    }, [exerciseFormObject.date])

    // when update button is clicked
    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();
        // send put request with the form object
        await API.updateFitnessEntry(token, exerciseFormObject)
        .then((res) => {
            // send update request to reload cards
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        // reset the form object
        setExerciseFormObject({
            date: '',
            activity_type: '',
            activity_duration: '',
            RPE: '',
            notes: ''
        })
        // reset update request to false
        setUpdateReq(false)
    })

    // when submit button is clicked
    const sendCreate = useCallback(async (e) => {
        e.preventDefault();
        // send post request
        await API.postFitnessEntry(token, exerciseFormObject)
        .then((res) => {
            // send update request to reload cards
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        // reset the form object
        setExerciseFormObject({
            date: '',
            activity_type: '',
            activity_duration: '',
            RPE: '',
            notes: ''
        })
        // reset update request to false
        setUpdateReq(false)
    })

    // when delete button is clicked
    const sendDelete = useCallback(async (e) => {
        e.preventDefault();
        // send delete request
        API.deleteFitnessEntry(token, exerciseFormObject.date)
        .then((response) => {
            // update request desired to reload cards
            setUpdateReq(true)
        })
        .catch((err) => console.log(err))
        // clear the form
        setExerciseFormObject({
            date: '',
            activity_type: '',
            activity_duration: '',
            RPE: '',
            notes: ''
        })
        // reset update request to false
        setUpdateReq(false)
    })

    // upon submitting a date, request data for another week 
    const reqAnotherWeek = useCallback(async (e) => {
        e.preventDefault();
        // if the date if valid, perform this block
        if (anotherDate) {
            let anotherWeek = [];
            for (let i = 1; i < 8; i++) {
                // get the m-sun week of the date input
                let thisDay = moment(anotherDate).day(i).format("YYYY-MM-DD");
                anotherWeek.push(thisDay)
            }
            // same logic as rendering this week's data (see above)
            const anotherFitnessArray = [];
            anotherWeek.map(entry => {
                var response = Data.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);

                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, activity_type, activity_duration, RPE, notes } = response;
                    newObj.id = id
                    newObj.activity_type = activity_type;
                    newObj.activity_duration = activity_duration;
                    newObj.RPE = RPE;
                    newObj.notes = notes;
                }
                anotherFitnessArray.push(newObj)
            })
            anotherFitnessArray[0].day = 'Monday';
            anotherFitnessArray[1].day = 'Tuesday';
            anotherFitnessArray[2].day = 'Wednesday';
            anotherFitnessArray[3].day = 'Thursday';
            anotherFitnessArray[4].day = 'Friday';
            anotherFitnessArray[5].day = 'Saturday';
            anotherFitnessArray[6].day = 'Sunday';
            setAnotherWeek(anotherFitnessArray)
            setError('')
        // if the date is not valid, (ie form was cleared) send error message
        } else {
            setError('Please choose a valid date.')
        }
    })


    return (
        <div className="fitness">
            {!isLoggedIn ? (
                <h2><Link className="pageLink" to='/login'>Click here to login</Link></h2>
            ) : (
            <>
            <h1>Fitness</h1>
            {goalObj.fitness_time || goalObj.fitness_frequency ? (
                <>
            <h2>Your Goals</h2>
            {goalObj.fitness_time != 0 && (
                <h4 className=''>Your exercise time goal is {goalObj.fitness_time} minutes per week. </h4>
            )}
            {goalObj.fitness_frequency != 0 && (
                <h4 className=''>Your exercise frequency goal is {goalObj.fitness_frequency} days per week. </h4>
            )}
            </>
            ) : (
                <></>
            )}
            <h2>Report Fitness Data</h2>
            <form className="fitnessForm">
                    <label className='fitnessLabel' htmlFor="formDate">
                        Choose date:
                    </label>
                    <input 
                        className='fitnessInput'
                        value={exerciseFormObject.date}
                        type="date"
                        id="formDate"
                        name="formDate"
                        onChange={(e) => setExerciseFormObject({ ...exerciseFormObject, date: e.target.value })}
                    />
                    <label className='fitnessLabel' htmlFor="formType">
                        What type of exercise did you complete?
                    </label>
                    <input
                        className='fitnessInput'
                        value={exerciseFormObject.activity_type}
                        type="text"
                        id="formType"
                        name="formType"
                        placeholder="i.e. running, lifting, HIIT, tai chi, pilates, etc."
                        onChange={(e) => setExerciseFormObject({ ...exerciseFormObject, activity_type: e.target.value })}
                    />
                    <label className='fitnessLabel' htmlFor="formDuration">
                        How many minutes did you exercise for? Note: if left blank will report '0 minutes'. If you took a rest day, please leave blank or enter '0'.
                    </label>
                    <input
                        className='fitnessInput'
                        value={exerciseFormObject.activity_duration}
                        type="number"
                        id="formDuration"
                        min='0'
                        name="formDuration"
                        placeholder="45"
                        onChange={(e) => setExerciseFormObject({ ...exerciseFormObject, activity_duration: e.target.value })}
                    />
                    <label className='fitnessLabel' htmlFor="formRPE">
                        On the scale of Rate of Perceived Exertion (RPE), from 0 (easy) to 10 (extremely difficult), how hard did you work?
                    </label>
                    <input
                        className='fitnessInput'
                        value={exerciseFormObject.RPE}
                        type="number"
                        min="0"
                        max='10'
                        id="formRPE"
                        name="formRPE"
                        placeholder='7'
                        onChange={(e) => setExerciseFormObject({ ...exerciseFormObject, RPE: e.target.value })} />
                    <label className='fitnessLabel' htmlFor="formNotes">
                        Notes from your workout:
                    </label>
                    <input
                        className='fitnessInput'
                        value={exerciseFormObject.notes}
                        type="text"
                        id="formNotes"
                        name="formNotes"
                        placeholder='pyramid HIIT workout for total of 800 bodyweight reps'
                        onChange={(e) => setExerciseFormObject({ ...exerciseFormObject, notes: e.target.value })}
                    />
                    <br />
                    {/* if there was a matching data entry for the date, show update and delete buttons */}
                    {(existingItem == true) ? (
                        <>
                            <button type="button" className="fitnessBtn" 
                                onClick={sendUpdate}>Update</button>
                            <button type="button" className="fitnessBtn" 
                                onClick={sendDelete}>Delete</button>
                        </>
                    ) : (
                        // else show submit button
                        <button className="fitnessBtn" type="button" onClick={sendCreate}>Submit</button>
                    )}
                    </form>
                    <br />
                    <h2>This week's fitness reporting: </h2>
                    <ExerciseCard
                        results={thisWeek}
                    />


                    <div className='anotherWeekSection'>
                        <h2>View another week's fitness reporting:</h2>
                        <form className='chooseDate'>
                            <label htmlFor='anotherDate'>Date</label>
                            <input
                                value={anotherDate}
                                type="date"
                                name="anotherDate"
                                onChange={(e) => setAnotherDate(e.target.value)}
                            />
                            {error && (
                                <div>
                                    <p className="error">{error}
                                    </p>
                                </div>
                            )}
                            <button className="fitnessBtn" type="button" onClick={reqAnotherWeek}>Submit</button>
                        </form>
                        {anotherWeek ? (
                            <ExerciseCard
                                results={anotherWeek} />
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}