import React, { useState, useEffect, useCallback } from 'react';
import './mindfulness.css'
import { Link } from 'react-router-dom';
import API from "../../../utils/API.js"
import moment from 'moment';
import MindfulCard from './MindfulCard';

export default function Mindfulness({ token, weekArray, goalObj, isLoggedIn }) {
    const [Data, setData] = useState({});
    const [thisWeek, setThisWeek] = useState([]);
    const [mindObj, setMindObj] = useState({
        date: '',
        activities_completed: '',
        journal: '',
        overall_mood: '',
        quote_of_the_day: '',
    })
    const [updateReq, setUpdateReq] = useState('');
    const [existingItem, setExistingItem] = useState('');
    const [anotherDate, setAnotherDate] = useState('');
    const [anotherWeek, setAnotherWeek] = useState('');
    const [error, setError] = useState('');
    const [incomplete, setIncomplete] = useState('')
// same logic as exercise page. different keys in objects.
    useEffect(() => {
        API.getUserMindfulness(token)
            .then((userData) => {
                setData(userData)
                const mindfulnessArray = [];
                weekArray.map(entry => {
                    var response = userData.find(data => data.date === entry);
                    let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);
                    let newObj = { date: dateFormat };
                    newObj.rawDate = entry;

                    if (response === undefined) {
                        newObj.status = 'Not Reported';
                    } else {
                        const { id, date, activities_completed, journal, overall_mood, quote_of_the_day } = response;
                        newObj.id = id;
                        newObj.activities_completed = activities_completed;
                        newObj.journal = journal;
                        newObj.overall_mood = overall_mood;
                        newObj.quote_of_the_day = quote_of_the_day;
                    }
                    mindfulnessArray.push(newObj)
                })
                mindfulnessArray[0].day = 'Monday';
                mindfulnessArray[1].day = 'Tuesday';
                mindfulnessArray[2].day = 'Wednesday';
                mindfulnessArray[3].day = 'Thursday';
                mindfulnessArray[4].day = 'Friday';
                mindfulnessArray[5].day = 'Saturday';
                mindfulnessArray[6].day = 'Sunday';
                setThisWeek(mindfulnessArray)
            })
            .catch((err) => console.log(err))
    }, [token, updateReq])

    useEffect(() => {
        API.getOneUserMindfulness(token, mindObj.date)
            .then((res) => {
                if (res.id) {
                    setMindObj({
                        date: res.date,
                        activities_completed: res.activities_completed,
                        journal: res.journal,
                        overall_mood: res.overall_mood,
                        quote_of_the_day: res.quote_of_the_day,
                    })
                    setExistingItem(true);
                } else {
                    setMindObj({
                        date: mindObj.date,
                        activities_completed: '',
                        journal: '',
                        overall_mood: '',
                        quote_of_the_day: '',
                    })
                    setExistingItem(false);
                }
            })
            .catch((err) => console.log(err))
    }, [mindObj.date])

    const sendUpdate = useCallback(async (e) => {
        e.preventDefault();
        if (mindObj.activities_completed == '') {
            setIncomplete('Please enter data');
        } else {
            await API.updateMindfulnessEntry(token, mindObj)
                .then((res) => {
                    setUpdateReq(true)
                })
                .catch((err) => console.log(err))

            setMindObj({
                date: '',
                activities_completed: '',
                journal: '',
                overall_mood: '',
                quote_of_the_day: '',
            })
            setUpdateReq(false)
            setIncomplete('')
        }
    })

    const sendCreate = useCallback(async (e) => {
        e.preventDefault();
        if (mindObj.activities_completed == '' && mindObj.journal == '' && mindObj.overall_mood == '' && mindObj.quote_of_the_day == '') {
            setIncomplete('Please enter data');
        } else {
            await API.postMindfulnessEntry(token, mindObj)
                .then((res) => {
                    setUpdateReq(true)
                })
                .catch((err) => console.log(err))
            setMindObj({
                date: '',
                activities_completed: '',
                journal: '',
                overall_mood: '',
                quote_of_the_day: '',
            })
            setUpdateReq(false)
            setIncomplete('')
        }
    })

    const sendDelete = useCallback(async (e) => {
        e.preventDefault();
        API.deleteMindfulnessEntry(token, mindObj.date)
            .then((response) => {
                setUpdateReq(true)
            })
            .catch((err) => console.log(err))
        setMindObj({
            date: '',
            activities_completed: '',
            journal: '',
            overall_mood: '',
            quote_of_the_day: '',
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

            const anotherMindfulArray = [];
            anotherWeek.map(entry => {
                var response = Data.find(data => data.date === entry);
                let dateFormat = entry.slice(5) + "-" + entry.slice(0, 4);

                let newObj = { date: dateFormat }

                if (response === undefined) {
                    newObj.status = 'Not Reported';
                } else {
                    const { id, date, activities_completed, journal, overall_mood, quote_of_the_day } = response;
                    newObj.id = id
                    newObj.activities_completed = activities_completed;
                    newObj.journal = journal;
                    newObj.overall_mood = overall_mood;
                    newObj.quote_of_the_day = quote_of_the_day;
                }
                anotherMindfulArray.push(newObj)
            })
            anotherMindfulArray[0].day = 'Monday';
            anotherMindfulArray[1].day = 'Tuesday';
            anotherMindfulArray[2].day = 'Wednesday';
            anotherMindfulArray[3].day = 'Thursday';
            anotherMindfulArray[4].day = 'Friday';
            anotherMindfulArray[5].day = 'Saturday';
            anotherMindfulArray[6].day = 'Sunday';
            setAnotherWeek(anotherMindfulArray)
            setError('')
        } else {
            setError('Please choose a valid date.')
        }
    })

    return (
        <div className="mindful">
            {!isLoggedIn ? (
                <h2><Link className="pageLink" to='/login'>Click here to login</Link></h2>
            ) : (
                <>
                    <h1>Mindfulness</h1>
                    {goalObj.mindfulness_frequency != 0 && (
                        <>
                        <h2>Your Goals</h2>
                        <h4 className=''>Your goal is to practice mindfulness {goalObj.mindfulness_frequency} times per week.</h4>
                        </>
                    )}
                    <h2>Report Mindfulness Practice</h2>
                    <form className="mindfulForm">
                        <label htmlFor="mindfulDate">
                            Choose date:
                        </label>
                        <input
                            value={mindObj.date}
                            type="date"
                            name="mindfulDate"
                            onChange={(e) => setMindObj({ ...mindObj, date: e.target.value })}
                        />
                        <label className='mindfulLabel' htmlFor="mindfulActivities">
                            What mindfulness activities did you complete?
                        </label>
                        <input
                            className='mindfulInput'
                            value={mindObj.activities_completed}
                            type="text"
                            name="mindfulActivities"
                            placeholder='i.e. yoga, meditation, breathing, body scan, etc.'
                            onChange={(e) => setMindObj({ ...mindObj, activities_completed: e.target.value })}
                        />
                        <label className='mindfulLabel' htmlFor="mindfulJournal">
                            Journal Entry for Today:
                        </label>
                        <textarea
                            type='text'
                            name='mindfulJournal'
                            rows='8'
                            placeholder='use this space as your journal to write about whatever you want!'
                            value={mindObj.journal}
                            onChange={(e) => setMindObj({ ...mindObj, journal: e.target.value })}
                        />
                        <label className='mindfulLabel' htmlFor="mindfulMood">
                            What was your overall mood today?
                        </label>
                        <input
                            className='mindfulInput'
                            value={mindObj.overall_mood}
                            type="text"
                            name='mindfulMood'
                            placeholder='anxious'
                            onChange={(e) => setMindObj({ ...mindObj, overall_mood: e.target.value })}
                        />
                        <label className='mindfulLabel' htmlFor="mindfulQuote">
                            Quote of the day:
                        </label>
                        <input
                            className='mindfulInput'
                            value={mindObj.quote_of_the_day}
                            type="text"
                            name="mindfulQuote"
                            placeholder='"Realize deeply that the present moment is all you ever have." -Eckhart Tolle'
                            onChange={(e) => setMindObj({ ...mindObj, quote_of_the_day: e.target.value })}
                        />
                        {incomplete && (
                            <div>
                                <p className="error">{incomplete}
                                </p>
                            </div>
                        )}
                        {(existingItem == true) ? (
                            <>
                                <button type="button" className="mindfulBtn"
                                    onClick={sendUpdate}>Update</button>
                                <button type="button" className="mindfulBtn"
                                    onClick={sendDelete}>Delete</button>
                            </>
                        ) : (
                            <button className="mindfulBtn" type="button" onClick={sendCreate}>Submit</button>
                        )}
                    </form>

                    <br />
                    <h2>This week's mindfulness reporting:</h2>
                    <MindfulCard
                        results={thisWeek}
                    />

                    <div className='anotherWeekSection'>
                        <h2>View another week's mindfulness reporting:</h2>
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
                            <button className="mindfulBtn" type="button" onClick={reqAnotherWeek}>Submit</button>
                        </form>
                        {anotherWeek ? (
                            <MindfulCard
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
