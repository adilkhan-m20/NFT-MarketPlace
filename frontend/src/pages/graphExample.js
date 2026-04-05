import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(
      first: 5
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default function GraphExample() {
  const { loading, error, data } = useQuery(GET_ACTIVE_ITEMS);

  console.log(data);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error...</div>;

  return <div>Check console for data</div>;
}
