import {ReactQueryDevtools} from "@tanstack/react-query-devtools";
import Header from "@/components/Header";
import AccountList from "@/components/AccountList";
import TransactionsList from "@/components/TransactionsList";

export const App = () => {
  return (
    <>
      <Header />
      <hr />
      <div className="p-4">
        <AccountList/>
        <div className="flex flex-col w-full p-4 gap-4">
          <h2 className="text-xl">Transactions</h2>
          <TransactionsList/>
        </div>
      </div>
      <ReactQueryDevtools initialIsOpen={false} />
    </>
  )
}

export default App
