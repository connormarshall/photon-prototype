import React, { useRef, useState, useEffect } from 'react';
import './App.css';
import Post from './Post.js';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

import { Input, Button, Modal, makeStyles } from '@material-ui/core';

//Firebase config
firebase.initializeApp({
    apiKey: "AIzaSyDRCfgUFGsKNTS8SoftXhxw6uINSbs_HRY",
    authDomain: "chat-app-15a88.firebaseapp.com",
    projectId: "chat-app-15a88",
    storageBucket: "chat-app-15a88.appspot.com",
    messagingSenderId: "946682101169",
    appId: "1:946682101169:web:aff90d0ef171f20f4d1190"}
  )


//Styles for Material UI
function getModalStyle() {
  const top = 50;
  const left = 50;

  return {
    top: `${top}%`,
    left: `${left}%`,
    transform: `translate(-${top}%, -${left}%)`,
  };
}

const useStyles = makeStyles((theme) => ({
  paper: {
  position: 'absolute',
  width: 400,
  backgroundColor: theme.palette.background.paper,
  border: '2px solid #000',
  boxShadow: theme.shadows[5],
  padding: theme.spacing(2, 4, 3),
},
}));

const firestore = firebase.firestore();
const auth = firebase.auth();

function App() {
  //Sign in authorisation
  const [emailUser, setEmailUser] = useState('');
  //Opening and closing of Modal windows
  const [open, setOpen] = useState(false);
  const [openSignIn, setOpenSignIn] = useState(false);
  //Modal styling
  const classes = useStyles();
  const [modalStyle] = React.useState(getModalStyle);
  //User sign-in data
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  //Creates a new user
  const signUp = (event) => {
    //Prevent refresh
    event.preventDefault();

    auth.createUserWithEmailAndPassword(email, password)
    .then((authUser) => {
      return authUser.user.updateProfile({displayName: username})
    })
    .catch((error) => alert(error.message))

  }

  //Logs in existing user
  const signIn = (event) => {
    event.preventDefault();
    auth.signInWithEmailAndPassword(email, password)
    .catch((error) => alert(error.message));

    setOpenSignIn(false);

  }

  //Sets the user's displayName when logged in and they change their username
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((authUser) => {
      if(authUser) {
        //User logged in
        console.log(authUser);
        setEmailUser(authUser);

      } else {
        //User logged out
        setEmailUser(null);

      }
    })

    return () => {
      //perform cleanup before refiring useEffect (prevent listener spam)
      unsubscribe();
    }

  }, [emailUser, username]);

  return (
    <div className="app">
      {/*Header*/}
      <ul className="app-header">
        <li><h1 className="logo">photon</h1></li>
        <li>
          {emailUser ?
            (<Button onClick={() => auth.signOut()}>Log Out</Button>)
          :
            (
              <div className="login-container">
                <Button onClick={() => setOpenSignIn(true)}>Sign In</Button>
                <Button onClick={() => setOpen(true)}>Sign Up</Button>
              </div>
            )
          }
        </li>
      </ul>

      {/*Body of app: if user is signed in, show PostFeed, else show sign-in*/}
      <section className="app-body">
        {emailUser ? <PostFeed /> : <p>Logged Out</p>}

        //Modal boxes for sign-in and sign-up
        <Modal
          open={openSignIn}
          onClose={() => setOpenSignIn(false)}
        >
          <div style={modalStyle} className={classes.paper}>
            <form>
              <h1 className="logo">photon</h1>

              <Input
                placeholder="email"
                type="text"
                value={email}
                onChange= {(e) => setEmail(e.target.value)}
              />

              <Input
                placeholder="password"
                type="password"
                value={password}
                onChange= {(e) => setPassword(e.target.value)}
              />

              <Button type="submit" onClick={signIn}>Sign In</Button>
            </form>
          </div>
        </Modal>

        <Modal
          open={open}
          onClose={() => setOpen(false)}
        >
          <div style={modalStyle} className={classes.paper}>
          <form>
            <h1 className="logo">photon</h1>

            <Input
              placeholder="username"
              type="text"
              value={username}
              onChange= {(e) => setUsername(e.target.value)}
            />

            <Input
              placeholder="email"
              type="text"
              value={email}
              onChange= {(e) => setEmail(e.target.value)}
            />

            <Input
              placeholder="password"
              type="password"
              value={password}
              onChange= {(e) => setPassword(e.target.value)}
            />

            <Button type="submit" onClick={signUp}>Sign Up</Button>
          </form>
          </div>
        </Modal>

      </section>

    </div>
  );
}

//Google sign-in popup component
//REDUNDANT as of current version, may be used later
function SignIn(emailUser) {

  return (
    <div className="sign-in">
      <div>
        <form>
          <h1 className="logo">photon</h1>

          <Input
            placeholder="username"
            type="text"
            value={username}
            onChange= {(e) => setUsername(e.target.value)}
          />

          <Input
            placeholder="email"
            type="text"
            value={email}
            onChange= {(e) => setEmail(e.target.value)}
          />

          <Input
            placeholder="password"
            type="password"
            value={password}
            onChange= {(e) => setPassword(e.target.value)}
          />

          <Button type="submit" onClick={signUp}>Sign Up</Button>
        </form>

        <p>OR</p>

        {/*<Button onClick={signInWithGoogle}>Sign in with Google</Button>*/}
        <p>community guidelines apply</p>
      </div>
    </div>
  )

}

//PostFeed containing posts
function PostFeed() {
  //Reference to the 'posts' collection in Firebase
  const postsRef = firestore.collection('posts');
  //25 posts, ordered by most recent creation
  const query = postsRef.orderBy('createdAt').limit(25);
  //camera to bottom
  const dummy = useRef();

  //Firebase hook: fetch the data from the query, and the id
  const [posts] = useCollectionData(query, {idField: 'id'});
  //useState() functions for input form
  const [formValue, setFormValue] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  //async function for submitting a post
  const sendMessage = async(e) => {
    //Prevents the page from refreshing on form submission
    e.preventDefault();

    //Fetch the user id and photo of the google account, store it in a tuple
    const { uid, photoURL } = auth.currentUser;
    //Fetch username of the logged in user
    const username = auth.currentUser.displayName;

    //add a new document to the collection according to info in form
    await postsRef.add({
      caption: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      image: imgUrl,
      username: username,
      uid,
      photoURL
    });

    //reset form values
    setFormValue('');
    setImgUrl('');

    //scroll camera to the dummy (bottom-most post)
    dummy.current.scrollIntoView({ behaviour: 'smooth' });

  }

  //REACT return
  return (
    <>
      {/*Map all posts to the PostMessage component*/}
      <main className="post-feed">
        {posts && posts.map(msg => <PostMessage key={msg.id} message={msg} />)}
        {/*Update the position of the dummy after the last chat message, so camera tracks to it*/}
        <div ref={dummy}></div>
      </main>

      {/*Form at bottom for submitting new posts*/}
      <form className="post-form" onSubmit={sendMessage}>
        <input placeholder=" Caption" value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
          <input placeholder=" Image URL" value={imgUrl} onChange={(e) => setImgUrl(e.target.value)}/>
        <button type="submit">⫸</button>
      </form>
    </>

  )

}

//Chat message component
function PostMessage(props) {
  //parameters of a PostMessage component
  const { caption, username, avatarUrl, image } = props.message;
  //Determine whether a message was sent by the user of recieved by them
  const messageClass = username === auth.currentUser.username ? 'sent' : 'recieved';

  //Return the message with a css class according to whether it was sent or recieved
  return (
      <Post
        className="${messageClass}"
        username={props.message.username}
        imageUrl={props.message.image}
        caption={props.message.caption}
      />
  )

}

export default App;
