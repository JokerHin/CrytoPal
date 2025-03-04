import React from "react";
import { useQuery } from "@tanstack/react-query";
import { gql, request } from "graphql-request";

const query = gql`
  {
    deposits {
      id
      user
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
    withdraws {
      id
      user
      amount
      blockNumber
      blockTimestamp
      transactionHash
    }
  }
`;

const url =
  "https://api.studio.thegraph.com/query/105168/cryptopalgraph/version/latest";

const TheGraph = () => {
  const { data, status } = useQuery({
    queryKey: ["data"],
    async queryFn() {
      return await request(url, query);
    },
  });

  if (status === "loading") return <p>Loading...</p>;
  if (status === "error") return <p>Error occurred querying the Subgraph</p>;

  if (!data || !data.deposits || !data.withdraws) {
    return <p>No data available</p>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Deposits</h2>
      {data.deposits.map((deposit) => (
        <div
          key={deposit.id}
          className="p-4 mb-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-100"
        >
          <p className="text-lg">
            <strong>User:</strong> {deposit.user}
          </p>
          <p className="text-lg">
            <strong>Amount:</strong> {deposit.amount}
          </p>
          <p className="text-lg">
            <strong>Block Number:</strong> {deposit.blockNumber}
          </p>
          <p className="text-lg">
            <strong>Timestamp:</strong>{" "}
            {new Date(deposit.blockTimestamp * 1000).toString()}
          </p>
          <p className="text-lg">
            <strong>Transaction Hash:</strong> {deposit.transactionHash}
          </p>
        </div>
      ))}
      <h2 className="text-2xl font-bold mb-4">Withdraws</h2>
      {data.withdraws.map((withdraw) => (
        <div
          key={withdraw.id}
          className="p-4 mb-4 border rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 bg-gray-100"
        >
          <p className="text-lg">
            <strong>User:</strong> {withdraw.user}
          </p>
          <p className="text-lg">
            <strong>Amount:</strong> {withdraw.amount}
          </p>
          <p className="text-lg">
            <strong>Block Number:</strong> {withdraw.blockNumber}
          </p>
          <p className="text-lg">
            <strong>Timestamp:</strong>{" "}
            {new Date(withdraw.blockTimestamp * 1000).toString()}
          </p>
          <p className="text-lg">
            <strong>Transaction Hash:</strong> {withdraw.transactionHash}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TheGraph;
