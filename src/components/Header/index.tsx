import React, {useEffect, useState} from 'react';
import {Search} from "lucide-react";
import Logo from "@/assets/react.svg";
import {Input} from "@/components/ui/input";
import {useSearchAccounts} from "@/api.ts";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import TransferFundsForm from "@/components/TransferFundsForm";

const Header:React.FC = () => {
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState<boolean>(false)
  const [searchText, setSearchText] = useState<string>("");
  const { data } = useSearchAccounts(searchText);

  useEffect(() => {
    if (!isTransferDialogOpen) {
      setSearchText("")
    }
  }, [isTransferDialogOpen]);

  return (
    <div className="px-6 py-2 flex justify-between items-center">
      <div className="flex items-center gap-8">
        <img src={Logo} alt="Logo"/>
      </div>
      <div className="relative ml-auto flex-1 md:grow-0">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground"/>
        <Input
          type="search"
          placeholder="Search..."
          value={searchText}
          onChange={(event) => setSearchText(event.target.value)}
          className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[336px]"
        />
        {data && (
          <div style={{zIndex: 10}}
               className="absolute bg-white top-full mt-1 left-0 w-full border border-input rounded-lg divide-gray-200 divide-y-2 flex flex-col">
            {data?.map((account) => (
              <div key={account.id}>
                <div className="px-4 py-2 hover:bg-muted/50 cursor-pointer"
                     onClick={() => setIsTransferDialogOpen(true)}>
                  {account.ownerName} - {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: account.currency || "USD",
                  }).format(account.balance)}
                </div>
                <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
                  <DialogContent data-testid={`dialog-${account.id}`}>
                    <DialogHeader>
                      <DialogTitle>Transfer</DialogTitle>
                      <DialogDescription>
                        This action cannot be undone. This will permanently delete your account
                        and remove your data from our servers.
                      </DialogDescription>
                    </DialogHeader>
                    <div>
                      <TransferFundsForm toAccountId={account.id} callback={() => setIsTransferDialogOpen(false)}/>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Header;