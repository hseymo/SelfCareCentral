import React, { useState, useEffect, useCallback } from 'react';
import './sleep.css';
import { Link } from 'react-router-dom';
import API from "../../../utils/API.js";
import SleepCard from "./SleepCard";
import moment from 'moment'

export default function Sleep({ token, weekArray, goalObj, isLoggedIn }) {
    const [Data, setData] = useState({});
    const [thisWeek, setThisWeek] = useState([]);
    const [sleepFormObject, setSleepFormObject] = useState({
        date: '',
        time_asleep: '',
        diff_falling_asleep: '',
        diff_staying_asleep: '',
        mood_upon_wake: ''
    })
    const [updateReq, setUpdateReq] = useState('');
    const [existingItem, setExistingItem] = useState('');
    const [anotherDate, setAnotherDate] = useState('');
    const [anotherWeek, setAnotherWeek] = useState('');
    const [error, setError] = useState('');

    // same logic as exercise page. different keys in objects.
    useEffect(() => {
        API.getUserSleep(token).then((userData) => {
            setData(userData)
            const sleepArray = [];
            weekArray.map(entry => {
                var response = userData.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);

                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, time_asleep, diff_falling_asleep, diff_staying_asleep, mood_upon_wake } = response;
                    // falsey values will always default to false
                    newObj.id = id;
                    newObj.time_asleep = time_asleep;
                    newObj.mood_upon_wake = mood_upon_wake;
                    if (diff_falling_asleep === "true") {
                        newObj.diff_falling_asleep = 'Y'
                    } else if (diff_falling_asleep === "false") {
                        newObj.diff_falling_asleep = 'N'
                    }
                    if (diff_staying_asleep === "true") {
                        newObj.diff_staying_asleep = 'Y'
                    } else if (diff_staying_asleep === "false") {
                        newObj.diff_staying_asleep = 'N'
                    }
                }
                sleepArray.push(newObj);
            })
            sleepArray[0].day = 'Monday';
            sleepArray[1].day = 'Tuesday';
            sleepArray[2].day = 'Wednesday';
            sleepArray[3].day = 'Thursday';
            sleepArray[4].day = 'Friday';
            sleepArray[5].day = 'Saturday';
            sleepArray[6].day = 'Sunday';
            setThisWeek(sleepArray)
        })
            .catch((err) => console.log(err))
    }, [token, updateReq])

    useEffect(() => {
        API.getOneUserSleep(token, sleepFormObject.date).then((res) => {
            if (res.id) {
                setSleepFormObject({
                    date: res.date,
                    time_asleep: res.time_asleep,
                    diff_falling_asleep: res.diff_falling_asleep,
                    diff_staying_asleep: res.diff_staying_asleep,
                    mood_upon_wake: res.mood_upon_wake
                })
                setExistingItem(true);
            } else {
                setSleepFormObject({
                    date: sleepFormObject.date,
                    time_asleep: '',
                    diff_falling_asleep: '',
                    diff_staying_asleep: '',
                    mood_upon_wake: ''
                })
                setExistingItem(false);
            }
        })
            .catch((err) => console.log(err))
    }, [sleepFormObject.date])

    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();
        await API.updateSleepEntry(token, sleepFormObject).then((res) => {
            setUpdateReq(true)
        })
            .catch((err) => console.log(err))
        setSleepFormObject({
            date: '',
            time_asleep: '',
            diff_falling_asleep: '',
            diff_staying_asleep: '',
            mood_upon_wake: ''
        })
        setUpdateReq(false)
    })

    const sendCreate = useCallback(async (e) => {
        e.preventDefault();
        await API.postSleepEntry(token, sleepFormObject).then((res) => {
            setUpdateReq(true)
        })
            .catch((err) => console.log(err))
        setSleepFormObject({
            date: '',
            time_asleep: '',
            diff_falling_asleep: '',
            diff_staying_asleep: '',
            mood_upon_wake: ''
        })
        setUpdateReq(false)
    })

    const sendDelete = useCallback(async (e) => {
        e.preventDefault();
        await API.deleteSleepEntry(token, sleepFormObject.date).then((response) => {
            setUpdateReq(true)
        })
            .catch((err) => console.log(err))
        setSleepFormObject({
            date: '',
            time_asleep: '',
            diff_falling_asleep: '',
            diff_staying_asleep: '',
            mood_upon_wake: ''
        })
        setUpdateReq(false)
    })

    const reqAnotherWeek = useCallback(async (e) => {
        e.preventDefault();
        if (anotherDate) {
            let anotherWeek = [];
            for (let i = 1; i < 8; i++) {
                let thisDay = moment(anotherDate).day(i).format("YYYY-MM-DD");
                anotherWeek.push(thisDay)
            }

            const anotherSleepArray = [];
            anotherWeek.map(entry => {
                var response = Data.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);

                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, time_asleep, diff_falling_asleep, diff_staying_asleep, mood_upon_wake } = response;

                    newObj.id = id;
                    newObj.time_asleep = time_asleep;
                    newObj.mood_upon_wake = mood_upon_wake;
                    if (diff_falling_asleep === "true") {
                        newObj.diff_falling_asleep = 'Y'
                    } else if (diff_falling_asleep === "false") {
                        newObj.diff_falling_asleep = 'N'
                    }
                    if (diff_staying_asleep === "true") {
                        newObj.diff_staying_asleep = 'Y'
                    } else if (diff_staying_asleep === "false") {
                        newObj.diff_staying_asleep = 'N'
                    }
                }
                anotherSleepArray.push(newObj);
            })
            anotherSleepArray[0].day = 'Monday';
            anotherSleepArray[1].day = 'Tuesday';
            anotherSleepArray[2].day = 'Wednesday';
            anotherSleepArray[3].day = 'Thursday';
            anotherSleepArray[4].day = 'Friday';
            anotherSleepArray[5].day = 'Saturday';
            anotherSleepArray[6].day = 'Sunday';
            setAnotherWeek(anotherSleepArray)
            setError('')
        } else {
            setError('Please choose a valid date.')
        }
    })

    return (
        <div className="sleep">
            {!isLoggedIn ? (
                <h2><Link className="pageLink" to='/login'>Click here to login</Link></h2>
            ) : (
                <>
                    <h1>Sleep</h1>
                    {goalObj.sleep_time != 0 && (
                        <>
                        <h2>Your Goals</h2>
                        <h4 className=''>Your nightly sleep goal is {goalObj.sleep_time} hours.</h4>
                        </>
                    )}
                    <h2>Report Sleep Data</h2>
                    <form className='sleepForm'>
                        <label htmlFor='formDate'>Date</label>
                        <input
                            className='sleepInput'
                            value={sleepFormObject.date}
                            type="date"
                            name="formDate"
                            onChange={(e) => setSleepFormObject({ ...sleepFormObject, date: e.target.value })}
                        />
                        <label htmlFor='formTime'>How long did you sleep? If left blank, will report '0 hours'.</label>
                        <input
                            className='sleepInput'
                            value={sleepFormObject.time_asleep}
                            type="number"
                            min='0'
                            max='24'
                            onChange={(e) => setSleepFormObject({ ...sleepFormObject, time_asleep: e.target.value })}
                            placeholder="8"
                        />
                        <label htmlFor='formDiffFall'>Did you have difficulty falling asleep?</label>
                        <select
                            className='sleepOption'
                            value={sleepFormObject.diff_falling_asleep}
                            type="boolean"
                            name="formDiffFall"
                            onChange={(e) => setSleepFormObject({ ...sleepFormObject, diff_falling_asleep: e.target.value })}
                            placeholder="true/false"
                            defaultValue=''
                        >
                            <option selected disabled={true} value=''>Select an option</option>
                            <option className="sleepOption" value={true}>Yes</option>
                            <option className="sleepOption" value={false}>No</option>
                        </select>
                        <label htmlFor='formDiffStay'>Did you have difficulty staying asleep?</label>
                        <select
                            className='sleepOption'
                            value={sleepFormObject.diff_staying_asleep}
                            type="boolean"
                            name="formDiffStay"
                            onChange={(e) => setSleepFormObject({ ...sleepFormObject, diff_staying_asleep: e.target.value })}
                            placeholder="true/false"
                            defaultValue=''
                        >
                            <option selected disabled={true} value=''>Select an option</option>
                            <option className="sleepOption" value={true}>Yes</option>
                            <option className="sleepOption" value={false}>No</option>
                        </select>
                        <label htmlFor='formMood'>How did you feel when you woke up?</label>
                        <input
                            className='sleepInput'
                            value={sleepFormObject.mood_upon_wake}
                            type="text"
                            name="formMood"
                            onChange={(e) => setSleepFormObject({ ...sleepFormObject, mood_upon_wake: e.target.value })}
                            placeholder="Rested"
                        />
                        {(existingItem == true) ? (
                            <>
                                <button type="button" className="sleepBtn"
                                    onClick={sendUpdate}>Update</button>
                                <button type="button" className="sleepBtn"
                                    onClick={sendDelete}>Delete</button>
                            </>
                        ) : (
                            <button className="sleepBtn" type="button" onClick={sendCreate}>Submit</button>
                        )}
                    </form>
                    <h2> This week's sleep reporting:</h2>
                    <SleepCard
                        name='sleep'
                        results={thisWeek}
                        goal={goalObj.sleep_time} />

                    <div className='anotherWeekSection'>
                        <h2>View another week's sleep reporting:</h2>
                        <form className='chooseDate'>
                            <label htmlFor='anotherDate'>Date</label>
                            <input
                                className='sleepInput'
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
                            <button className="sleepBtn" type="button" onClick={reqAnotherWeek}>Submit</button>
                        </form>
                        {anotherWeek ? (
                            <SleepCard
                                name='anotherSleep'
                                results={anotherWeek}
                                goal={goalObj.sleep_time} />
                        ) : (
                            <></>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
