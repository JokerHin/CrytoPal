import React, { useState, useEffect } from "react";

const TransactionHistory = ({ userAddress }) => {
  const [transactions, setTransactions] = useState({
    incoming: [],
    outgoing: [],
  });

  useEffect(() => {
    if (userAddress) {
      fetchTransactionHistory(userAddress).then(setTransactions);
    }
  }, [userAddress]);

  return (
    <div>
      <h2>Transaction History</h2>

      <h3>Incoming Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>From</th>
            <th>Value</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.incoming.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.from}</td>
              <td>{tx.value}</td>
              <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Outgoing Transactions</h3>
      <table>
        <thead>
          <tr>
            <th>To</th>
            <th>Value</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>
          {transactions.outgoing.map((tx) => (
            <tr key={tx.id}>
              <td>{tx.to}</td>
              <td>{tx.value}</td>
              <td>{new Date(tx.timestamp * 1000).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TransactionHistory;
