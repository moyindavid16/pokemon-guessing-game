import {useQuery} from "@tanstack/react-query";
import {Key, useMemo, useRef, useState} from "react";
import Background from "../Background";
import {client} from "../main";
import altImg from "../pokeball.webp";
import {LazyLoadImage} from "react-lazy-load-image-component";
import { Link } from "react-router-dom";

export default function Game() {
  //STATES AND VARIABLES
  const [answerStatus, setAnswerStatus] = useState<undefined | Result>(undefined);
  const [score, setScore] = useState(0);
  const pokeArray = useRef<Key[]>([]);

  //QUERY HANDLER FUNCTION
  const randomPokeFetcher = () => {
    let id = Math.floor(Math.random() * 905) + 1;
    return fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then(res => res.json())
      .then(data => {
        console.log(data.name);
        pokeArray.current = [];
        return data;
      });
  };


  //QUERIES
  const {isFetching: poke1IsFetching, data: poke1, refetch: refetch1} = useQuery(["randomPokemon1"], randomPokeFetcher);
  const {isFetching: poke2IsFetching, data: poke2, refetch: refetch2} = useQuery(["randomPokemon2"], randomPokeFetcher);
  const {isFetching: poke3IsFetching, data: poke3, refetch: refetch3} = useQuery(["randomPokemon3"], randomPokeFetcher);

  //FUNCTIONS
  //FUNCTION FOR PLAY AGAIN ACTION
  const playAgain = () => {
    setAnswerStatus(undefined);
    refetch1();
    refetch2();
    refetch3();
  };
  // FUNCTION TO HANDLE RESPONSE FROM USER
  const handleAnswerClick = (userResponse: Key) => {
    if (userResponse == poke1.name) {
      if (answerStatus == undefined) setScore(score => score + 1);
      setAnswerStatus(Result.Correct);
    } else setAnswerStatus(Result.Wrong);
  };

  //ENUM FOR USERCLICK ANSWER CHECKING
  enum Result {
    Correct,
    Wrong,
  }

  let choices, pokeImage;
  //Loading state
  if (poke1IsFetching || poke2IsFetching || poke3IsFetching){
    choices = <div className="loadingBanner">Who's that Pokémon!</div>
    pokeImage=altImg;
  }
  else{
    if (pokeArray.current.length == 0)
    pokeArray.current = [poke1.name, poke2.name, poke3.name].sort(() => 0.5 - Math.random());
    choices = <UserChoices pokeArray={pokeArray.current} handleAnswerClick={handleAnswerClick}/>  
    pokeImage=poke1.sprites.front_default;
  }

  

  return (
    <div className="wrapper">
      <Link to="/" className="BackButton">← Back</Link>
      <div>Game page</div>
      <div>{score}</div>
      <LazyLoadImage
        src={pokeImage}
        placeholderSrc={altImg}
        width="120px"
        height="120px"
        delayTime={0}
      />
      <div className="answerChoices">{choices}</div>
      
      {answerStatus == undefined && <div>Make a Choice!</div>}
      {answerStatus == Result.Correct && <div>Correct</div>}
      {answerStatus == Result.Wrong && <div>Wrong</div>}
      <button onClick={() => playAgain()}>Play again</button>
    </div>
  );
}

function UserChoices({pokeArray, handleAnswerClick}: UserChoicesProps){
  return(
    <>
        {pokeArray.map(pokeName => (
          <button key={pokeName} className="answerChoiceButton" onClick={() => handleAnswerClick(pokeName)}>{pokeName}</button>
        ))}
      </>
  )
}

interface UserChoicesProps{
  pokeArray: Array<Key>,
  handleAnswerClick: Function
}