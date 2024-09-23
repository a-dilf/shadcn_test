'use client';

import React, { useState, useEffect, useCallback } from 'react';
// import Image from 'next/image';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { NavBar } from '@/components/NavBar';
import { type CarouselApi } from "@/components/ui/carousel"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
// import { useToast } from "@/hooks/use-toast"
// import { ToastAction } from "@/components/ui/toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

type TokenData = {
  id: number;
  image: string;
};

const tokenIds = Array.from({ length: 100 }, (_, i) => i + 1); // Example: 100 token IDs
const INITIAL_LOAD_COUNT = 5;

export default function Home() {
  // const { toast } = useToast()

  // const [activeIndex, setActiveIndex] = useState(0);
  const [api, setApi] = useState<CarouselApi>();
  const [tokenData, setTokenData] = useState<TokenData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  const fetchTokenData = useCallback(async (ids: number[]) => {
    const promises = ids.map(async (id) => {
      const response = await fetch(`https://api.prophetlady.com/api/v1/nft/${id}.json`);
      const data = await response.json();
      return { id, image: data.image || '' };
    });
    const results = await Promise.all(promises);
    return results;
  }, []);

  useEffect(() => {
    async function loadInitialTokens() {
      setLoading(true);
      const initialTokens = await fetchTokenData(tokenIds.slice(0, INITIAL_LOAD_COUNT));
      setTokenData(initialTokens);
      setLoadedCount(INITIAL_LOAD_COUNT);
      setLoading(false);
    }

    loadInitialTokens();
  }, [fetchTokenData]);

  useEffect(() => {
    if (loadedCount < tokenIds.length) {
      const loadMoreTokens = async () => {
        const nextBatch = tokenIds.slice(loadedCount, loadedCount + INITIAL_LOAD_COUNT);
        const newTokens = await fetchTokenData(nextBatch);
        setTokenData(prev => [...prev, ...newTokens]);
        setLoadedCount(prev => prev + newTokens.length);
      };

      loadMoreTokens();
    }
  }, [loadedCount, fetchTokenData]);

  useEffect(() => {
    if (!api) return;

    api.on("select", () => {
      const newIndex = api.selectedScrollSnap();
      // setActiveIndex(newIndex);

      if (newIndex + 3 >= loadedCount && loadedCount < tokenIds.length) {
        const nextBatch = tokenIds.slice(loadedCount, loadedCount + INITIAL_LOAD_COUNT);
        fetchTokenData(nextBatch).then(newTokens => {
          setTokenData(prev => [...prev, ...newTokens]);
          setLoadedCount(prev => prev + newTokens.length);
        });
      }
    });
  }, [api, loadedCount, fetchTokenData]);

  /*
  const handleInteraction = (action: string) => {
    const currentToken = tokenData[activeIndex];
    console.log(`Interaction: ${action} for token ${currentToken.id}`);
    // Implement your interaction logic here
  };
  */

  if (loading) {
    return <div className="flex justify-center items-center h-screen">Loading initial tokens...</div>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow flex flex-col justify-center items-center px-[5%]">
        <div className="center">
          <NavBar />
        </div>
        <div className="w-full max-w-[600px] flex justify-center space-x-4 mt-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline">Mint Menu</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Approve and Mint</DialogTitle>
                <DialogDescription>
                  Approve $PROPHET tokens for various uses here
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Approve
                  </Label>
                  <Input id="name" value="1" className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="username" className="text-right">
                    Mint
                  </Label>
                  <Input id="username" value="1" className="col-span-3" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Execute</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious href="#" />
              </PaginationItem>
              <PaginationItem>
                <PaginationLink href="#">1</PaginationLink>
              </PaginationItem>
              <PaginationItem>
                <PaginationEllipsis />
              </PaginationItem>
              <PaginationItem>
                <PaginationNext href="#" />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
        <div className="w-full max-w-[600px] aspect-[6/5] relative">
          <Carousel className="w-full max-w-[400px] h-full" setApi={setApi}>
            <CarouselContent>
              {tokenData.map((token) => (
                <CarouselItem key={token.id}>
                  <div className="w-full h-full flex items-center justify-center">
                    <img
                      src={token.image}
                      alt={`Token ${token.id}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="absolute left-4 top-1/2 transform -translate-y-1/2" />
            <CarouselNext className="absolute right-4 top-1/2 transform -translate-y-1/2" />
          </Carousel>
        </div>
        <div className="w-full max-w-[600px] flex justify-center space-x-4 mt-4">
          <Drawer>
            <DrawerTrigger>
              <Button>Handle</Button>
            </DrawerTrigger>
            <DrawerContent>
              <DrawerHeader>
                <DrawerTitle>Handle your Lady</DrawerTitle>
                <DrawerDescription>Operations can not be reversed</DrawerDescription>
              </DrawerHeader>
              <DrawerFooter>
                <Button>Level Up</Button>
                <Button>Level Max</Button>
                <Button>Stake</Button>
                <DrawerClose>
                  <Button variant="outline">Unstake</Button>
                </DrawerClose>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        </div>
        {loadedCount < tokenIds.length && (
          <div className="text-center mt-4">
            Loading more tokens in the background...
          </div>
        )}
      </main>
    </div>
  );
}