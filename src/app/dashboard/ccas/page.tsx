"use client";

import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface CCA {
  _id: string;
  name: string;
  category: string;
  heads: string[];
  contacts: string[];
  description: string;
  subcommittees: Subcommittee[];
}

interface Subcommittee {
  _id: string;
  name: string;
}

interface SignupData {
  cca: {
    _id: string;
    name: string;
  };
  reason: string;
  subcommittees: Subcommittee[];
}

interface SignedUpUser {
  info: {
    name: string;
    email: string;
    telegram: string;
  };
  signups: SignupData[];
}

const axios = require("axios");

const CCAComponent: React.FC = () => {
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isContactDialogOpen, setIsContactDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<CCA>(null);
  const [telegramHandle, setTelegramHandle] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [activities, setActivities] = useState<CCA[]>([]);
  const [signedUpCCAs, setCCAs] = useState<SignupData[]>([]);
  const [tempReason, setReason] = useState<string>("");

  const moveUp = (index: number, selectedActivity: CCA, setSelectedActivity: (_: CCA) => void) => {
    if (index === 0) return;

    const newOrder = [...selectedActivity.subcommittees];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];

    setSelectedActivity({
      ...selectedActivity,
      subcommittees: newOrder,
    });
  };

  const moveDown = (index: number, selectedActivity: CCA, setSelectedActivity: (_: CCA) => void) => {
    if (index === selectedActivity.subcommittees.length - 1) return;

    const newOrder = [...selectedActivity.subcommittees];
    [newOrder[index + 1], newOrder[index]] = [newOrder[index], newOrder[index + 1]];

    setSelectedActivity({
      ...selectedActivity,
      subcommittees: newOrder,
    });
  };

  const preventPropagation = (e: Event) => e.preventDefault();

  useEffect(() => {
    window.addEventListener("beforeunload", preventPropagation);
    return () => window.removeEventListener("beforeunload", preventPropagation);
  }, [email, name, signedUpCCAs, telegramHandle]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cca/list`);

        if (response.data.success) {
          setActivities(response.data.data);
          localStorage.setItem("ccas", JSON.stringify(response.data.data));
        }
      } catch (error) {
        console.error("Error fetching ccas:", error);
      }
    };
    const fetchSignedUp = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cca/info`);

        if (response.data.success) {
          setCCAs(response.data.data.signups);
          setEmail(response.data.data.info.email);
          setTelegramHandle(response.data.data.info.telegram);
          setName(response.data.data.info.name);
          localStorage.setItem("ccaInfo", JSON.stringify(response.data.data.signups));
        }
      } catch (error) {
        console.error("Error fetching CCA info:", error);
      }
    };

    fetchData();
    fetchSignedUp();
  }, []);

  const groupedActivities: { [key: string]: CCA[] } = activities.reduce(
    (groups: { [key: string]: CCA[] }, activity) => {
      if (!groups[activity.category]) {
        groups[activity.category] = [];
      }
      groups[activity.category].push(activity);
      return groups;
    },
    {},
  );

  function openModal(activityName: string) {
    const activity = activities.find(a => a.name === activityName);
    setSelectedActivity(activity);
    setReason("");

    // Populate with old data if exists
    const index = signedUpCCAs.findIndex(obj => obj.cca.name === activityName);

    if (index != -1) {
      const curData = signedUpCCAs[index];
      setReason(curData.reason);
      setSelectedActivity({ ...activity, subcommittees: curData.subcommittees });
    }

    setIsModalOpen(true);
  }

  async function submitCCA() {
    if (!email || !telegramHandle || !name) {
      toast({
        variant: "destructive",
        title: "All fields haven't been filled",
      });
      return;
    }
    const data: SignedUpUser = {
      info: {
        name: name,
        telegram: telegramHandle,
        email: email,
      },
      signups: signedUpCCAs,
    };

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/cca/signup`, data, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        toast({
          variant: "success",
          title: "Submitted Successfully",
        });
        window.removeEventListener("beforeunload", preventPropagation);
      } else {
        toast({
          variant: "destructive",
          title: "Submission failed with status",
        });
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error Submitting CCA",
        description: (error as Error).message,
      });
    }
  }

  function handleInvite() {
    if (isModalOpen) {
      const index = signedUpCCAs.findIndex(obj => obj.cca._id === selectedActivity._id);

      if (index != -1) {
        signedUpCCAs.splice(index, 1);
      }

      const newSignupData: SignupData = {
        cca: {
          _id: selectedActivity._id,
          name: selectedActivity.name,
        },
        reason: tempReason,
        subcommittees: selectedActivity.subcommittees,
      };

      setCCAs([...signedUpCCAs, newSignupData]);
      toast({
        title: "Added Successfully",
      });
    }
    setReason("");
    setIsModalOpen(false);
  }

  function handleSubmit() {
    submitCCA();
  }

  const deleteItems = (index: number) => {
    setCCAs(signedUpCCAs.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="flex flex-row items-center">
        <h1 className="m-8 text-2xl font-bold text-black">CCA List</h1>
        <Button onClick={handleSubmit}>Submit</Button>
      </div>

      <Card className="mx-8 my-4 flex w-auto items-center">
        <CardContent>
          <div className="flex w-[73vw] flex-row justify-between sm:w-[77vw]">
            <h2 className="my-6 text-xl font-bold">Contact Information</h2>
          </div>
          <div className="space-y-4">
            <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
            <Input
              value={telegramHandle}
              onChange={e => setTelegramHandle(e.target.value)}
              placeholder="Telegram Handle"
            />
          </div>
        </CardContent>
      </Card>
      <Card className="m-8 flex w-auto items-center">
        <CardContent>
          <div className="flex w-[73vw] flex-row justify-between sm:w-[77vw]">
            <h2 className="my-6 text-xl font-bold">Signed-Up CCAs</h2>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {signedUpCCAs.map((obj, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-white p-4 shadow-md">
                <button className="mx-2" onClick={() => openModal(obj.cca.name)}>
                  {obj.cca.name}
                </button>
                <div className="flex space-x-2">
                  <Button
                    onClick={() => {
                      deleteItems(i);
                    }}
                    className="rounded bg-white p-2 text-black hover:bg-gray-200"
                  >
                    ❌
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="mx-auto w-full max-w-4xl">
        {Object.entries(groupedActivities).map(([category, activities]) => (
          <Card key={category} className="mb-8">
            <CardHeader>
              <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {activities.map((activity, index) => (
                  <div
                    key={activity.name}
                    className={`cursor-pointer rounded-lg bg-muted p-4 transition-colors hover:bg-muted/80 ${
                      index % 2 === 0 ? "md:justify-self-start" : "md:justify-self-end"
                    }`}
                    onClick={() => openModal(activity.name)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-lg font-medium">{activity.name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
        {isModalOpen && selectedActivity && (
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogContent className="flex max-h-[90vh] min-w-[30vw] max-w-[95vw] flex-col overflow-y-auto lg:max-w-[50vw]">
              <DialogHeader>Why do you want to join {selectedActivity.name}?</DialogHeader>
              <div className="space-y-4">
                <Input
                  className="h-16"
                  value={tempReason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Reason..."
                />
              </div>
              <div className="flex flex-col justify-between gap-4 overflow-y-auto sm:flex-row">
                <DialogHeader className="flex-1">
                  <DialogTitle>{selectedActivity.name}</DialogTitle>
                  <DialogDescription>{selectedActivity.description}</DialogDescription>
                  <div>
                    <h4 className="text-sm font-medium">Heads</h4>
                    <p>{selectedActivity.heads.join(", ")}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium">Contacts</h4>
                    <p>{selectedActivity.contacts.join(", ")}</p>
                  </div>
                </DialogHeader>
                {selectedActivity.subcommittees.length !== 0 && (
                  <div className="w-full flex-1 grow sm:w-auto">
                    <div className="grid w-full gap-4">
                      <div className="mx-auto flex w-full px-2 py-6 md:px-3">
                        <div className="grid w-full gap-4">
                          <div className="grid gap-1">
                            <h1 className="text-lg font-bold tracking-tight">Rank Your Sub-Committees</h1>
                            <p>The subcommittees listed at the top are those that match your interests the most</p>
                          </div>
                          <Card>
                            <CardContent className="p-6">
                              <div className="grid gap-4">
                                {selectedActivity.subcommittees.map((item, index) => (
                                  <div
                                    key={index}
                                    className="flex items-center justify-between rounded-md bg-white p-4 shadow-md"
                                  >
                                    <span className="mx-2">{item.name}</span>
                                    <div className="flex space-x-2">
                                      <Button
                                        onClick={() => moveUp(index, selectedActivity, setSelectedActivity)}
                                        disabled={index === 0}
                                        className="rounded bg-white p-2 text-black hover:bg-gray-200"
                                      >
                                        ↑
                                      </Button>
                                      <Button
                                        onClick={() => moveDown(index, selectedActivity, setSelectedActivity)}
                                        disabled={index === selectedActivity.subcommittees.length - 1}
                                        className="rounded bg-white p-2 text-black hover:bg-gray-200"
                                      >
                                        ↓
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <Button className="mt-6" onClick={handleInvite}>
                Add to my list!
              </Button>
            </DialogContent>
          </Dialog>
        )}
        {isContactDialogOpen && (
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsContactDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={submitCCA}>Submit</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </>
  );
};

export default CCAComponent;
