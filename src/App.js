import React, { useRef, useState } from 'react';
import './App.css';
import Post from './Post.js';

import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

//Firebase config
firebase.initializeApp({
    apiKey: "AIzaSyDRCfgUFGsKNTS8SoftXhxw6uINSbs_HRY",
    authDomain: "chat-app-15a88.firebaseapp.com",
    projectId: "chat-app-15a88",
    storageBucket: "chat-app-15a88.appspot.com",
    messagingSenderId: "946682101169",
    appId: "1:946682101169:web:aff90d0ef171f20f4d1190"}
  )

const firestore = firebase.firestore();
const auth = firebase.auth();

function App() {
  //Signed in authorisation
  const [user] = useAuthState(auth);

  return (
    <div className="app">
      {/*Header*/}
      <ul className="app-header">
        <li><h1 className="logo">photon</h1></li>
        <li><SignOut /></li>
      </ul>

      {/*Body of app: if user is signed in, show PostFeed, else show sign-in*/}
      <section className="app-body">
        {user ? <PostFeed /> : <SignIn/>}
      </section>

    </div>
  );
}

//Google sign-in popup component
function SignIn() {
  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <div className="sign-in">
      <div>
        <button onClick={signInWithGoogle}>Sign in with Google</button>
        <p>Do not violate community guidelines bossman</p>
      </div>
    </div>
  )

}

//Sign-out button
function SignOut() {
  return auth.currentUser && (
    <button className ="sign-out" onClick={() => auth.signOut()}>Sign Out</button>

  )

}

//PostFeed containing posts
function PostFeed() {
  const postsRef = firestore.collection('posts');
  const query = postsRef.orderBy('createdAt').limit(25);
  const dummy = useRef();

  const [posts] = useCollectionData(query, {idField: 'id'});
  const [formValue, setFormValue] = useState('');
  const [imgUrl, setImgUrl] = useState('');

  const sendMessage = async(e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;
    const username = auth.currentUser.displayName;

    await postsRef.add({
      caption: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      image: imgUrl,
      username: username,
      uid,
      photoURL
    });

    setFormValue('');
    setImgUrl('');
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
      <Post className="${messageClass}" username={props.message.username} imageUrl={props.message.image} caption={props.message.caption}/>

  )

}

export default App;
