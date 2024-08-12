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
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
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
    setIsModalOpen(true);
  }

  function openInviteDialog() {
    setIsInviteDialogOpen(true);
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
          title: "Submitted Successfully",
        });
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
        toast({
          variant: "destructive",
          title: "CCA Already Exists, Remove to Update CCA",
        });
        return;
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
    setIsInviteDialogOpen(false);
  }

  function handleSubmit() {
    setIsContactDialogOpen(true);
  }

  const deleteItems = (index: number) => {
    setCCAs(signedUpCCAs.filter((_, i) => i !== index));
  };

  return (
    <>
      <h1 className="m-8 text-2xl font-bold text-black">CCA List</h1>
      <Card className="m-8 flex w-auto items-center">
        <CardContent>
          <div className="flex w-[73vw] flex-row justify-between sm:w-[77vw]">
            <h2 className="my-6 text-xl font-bold">Signed-Up CCAs</h2>
            <Button onClick={handleSubmit} className="my-6">
              Submit
            </Button>
          </div>
          <div className="flex items-center gap-4 overflow-x-auto pb-4">
            {signedUpCCAs.map((obj, i) => (
              <div key={i} className="flex items-center justify-between rounded-md bg-white p-4 shadow-md">
                <span className="mx-2">{obj.cca.name}</span>
                <div className="flex space-x-2">
                  <Button onClick={() => deleteItems(i)} className="rounded bg-white p-2 text-black hover:bg-gray-200">
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
            <DialogContent className="flex max-h-[90vh] min-w-[30vw] flex-col justify-between overflow-y-auto sm:flex-row">
              <DialogHeader>
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
              <div className="w-full sm:w-auto">
                <div className="grid gap-4">
                  {selectedActivity.subcommittees.length !== 0 && (
                    <div className="sm:w-2xl mx-auto flex w-full px-2 py-6 md:px-3">
                      <div className="grid gap-4">
                        <div className="grid gap-1">
                          <h1 className="text-lg font-bold tracking-tight">Rank Your Sub-Committees</h1>
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
                  )}
                  <Button className="mt-6" onClick={openInviteDialog}>
                    Sign UP!
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {isInviteDialogOpen && (
          <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>Reason to join {selectedActivity.name}</DialogHeader>
              <div className="space-y-4">
                <Input
                  className="h-16"
                  value={tempReason}
                  onChange={e => setReason(e.target.value)}
                  placeholder="Reason..."
                />
              </div>
              <h1 className="font-bold text-red-500"> DO NOTE THAT THIS ACTION IS IRREVERSIBLE </h1>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInvite}>Confirm</Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
        {isContactDialogOpen && (
          <Dialog open={isContactDialogOpen} onOpenChange={setIsContactDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader className="text-md font-bold">Contact Information</DialogHeader>
              <div className="space-y-4">
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
                <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
                <Input
                  value={telegramHandle}
                  onChange={e => setTelegramHandle(e.target.value)}
                  placeholder="Telegram Handle"
                />
              </div>
              <div></div>
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
