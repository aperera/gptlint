// This example violates the rule by creating a class component for a simple counter.
class Counter extends React.Component {
  state = { count: 0 }

  increment = () => {
    this.setState({ count: this.state.count + 1 })
  }

  render() {
    return (
      <div>
        <p>Count: {this.state.count}</p>
        <button onClick={this.increment}>Increment</button>
      </div>
    )
  }
}

// Generated by gpt-4-0125-preview
