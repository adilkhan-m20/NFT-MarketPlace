import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NFTMarketPlace/NFTMarketPlace";

import {
  ItemListed,
  ActiveItem,
  ItemBought,
  ItemCanceled,
} from "../generated/schema";

//  ITEM LISTED
export function handleItemListed(event: ItemListedEvent): void {
  let id = getIdFromEventParams(event.params.tokenId, event.params.nftAddress);

  let itemListed = ItemListed.load(id);
  let activeItem = ActiveItem.load(id);

  if (!itemListed) {
    itemListed = new ItemListed(id);
  }

  if (!activeItem) {
    activeItem = new ActiveItem(id);
  }

  // Common fields
  itemListed.seller = event.params.seller;
  activeItem.seller = event.params.seller;

  itemListed.nftAddress = event.params.nftAddress;
  activeItem.nftAddress = event.params.nftAddress;

  itemListed.tokenId = event.params.tokenId;
  activeItem.tokenId = event.params.tokenId;

  itemListed.price = event.params.price;
  activeItem.price = event.params.price;

  // Default buyer (not sold yet)
  activeItem.buyer = Address.fromString(
    "0x0000000000000000000000000000000000000000",
  );

  itemListed.save();
  activeItem.save();
}

//  ITEM CANCELED
export function handleItemCanceled(event: ItemCanceledEvent): void {
  let id = getIdFromEventParams(event.params.tokenId, event.params.nftAddress);

  let itemCanceled = new ItemCanceled(id);
  itemCanceled.seller = event.params.seller;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;
  itemCanceled.save();

  let activeItem = ActiveItem.load(id);

  //  SAFE CHECK (prevents crash)
  if (activeItem) {
    activeItem.buyer = Address.fromString(
      "0x000000000000000000000000000000000000dEaD",
    );
    activeItem.save();
  }
}

//  ITEM BOUGHT
export function handleItemBought(event: ItemBoughtEvent): void {
  let id = getIdFromEventParams(event.params.tokenId, event.params.nftAddress);

  let itemBought = new ItemBought(id);
  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  itemBought.save();

  let activeItem = ActiveItem.load(id);

  //  SAFE CHECK (prevents crash)
  if (activeItem) {
    activeItem.buyer = event.params.buyer;
    activeItem.save();
  }
}

//  Helper function (ID generator)
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
