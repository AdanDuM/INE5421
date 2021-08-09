// interface Automaton {
//   states: [],
//   alphabet: [],
//   transitionFunction: [],
//   initialState: 0,
//   finalStates: []
// }
type State = string;

interface Transition {
  origin: State;
  symbol: string;
  destination: State;
}

interface IAutomaton {
  states: Array<State>;
  alphabet: Set<string>;
  transitions: Array<Transition>;
  initial: State;
  finals: Array<State>;
}

export default IAutomaton;
