import { useState, useEffect } from 'react';
import { LibraryContractAddress } from '../config.js';
import {ethers} from 'ethers';
import axios from 'axios';

import Library from '../utils/Library.json'

import Book from './components/Book';

const Home: NextPage = () => {

  const [log,setlog]=useState(false);

  	const [currentAccount, setCurrentAccount] = useState('')
    const [correctNetwork, setCorrectNetwork] = useState(false)

    const [txError, setTxError] = useState(null)

    const [books, setBooks] = useState([]);
    const [bookName, setBookName] = useState('');
    const [bookAuthor, setBookAuthor] = useState('');
    const [bookYear, setBookYear] = useState('');
    const [bookFinished, setBookFinished] = useState('');

  // Calls Metamask to connect wallet on clicking Connect Wallet button
	const connectWallet = async () => {
		try {
			const { ethereum } = window
      console.log(ethereum);

			if (!ethereum) {
				console.log('Metamask not detected')
				return
			}
			let chainId = await ethereum.request({ method: 'eth_chainId'})
			console.log('Connected to chain:' + chainId)

			const goerliChainId = '0x5'
  
			if (chainId !== goerliChainId) {
        console.log(goerliChainId)
				alert('You are not connected to the Goerli  Testnet!')
				return
			}

			const accounts = await ethereum.request({ method: 'eth_requestAccounts' })

			console.log('Found account', accounts[0])
			setCurrentAccount(accounts[0])
      checkCorrectNetwork()
		} catch (error) {
			console.log('Error connecting to metamask', error)
		}
	}

  // Checks if wallet is connected to the correct network
const checkCorrectNetwork = async () => {
  const { ethereum } = window
  let chainId = await ethereum.request({ method: 'eth_chainId' })
  console.log('Connected to chain:' + chainId)

  const rinkebyChainId = '0x5'

  if (chainId == rinkebyChainId) {
    setCorrectNetwork(true)
  } else {
    setCorrectNetwork(false)
  }
}

const getBooks = async() => {
    try {
      const { ethereum } = window
      


      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const LibraryContract = new ethers.Contract(
          LibraryContractAddress,
          Library.abi,
          signer
        )
        console.log(LibraryContractAddress);
        console.log(ethereum);

        let booksFinished = await LibraryContract.getFinishedBooks()

        let booksUnFinished = await LibraryContract.getUnfinishedBooks()


        console.log(booksUnFinished);
        console.log("Books:- ")
        console.log(booksFinished);

        let books = booksFinished.concat(booksUnFinished)
        if(!currentAccount)
          setBooks([])
        else
          setBooks(books);

      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error)
      setTxError(error)
    }
  }

  const clickBookFinished = async (id) => {
    console.log(id);

    try {
      const { ethereum } = window

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum)
        const signer = provider.getSigner()
        const LibraryContract = new ethers.Contract(
          LibraryContractAddress,
          Library.abi,
          signer
        )

        let libraryTx = await LibraryContract.setFinished(id, true);

        console.log(libraryTx);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log('Error Submitting new Book', error)
      setTxError(error.message)
    }
  }

const submitBook = async () => {
  let book = {
      'name': bookName,
      'year': parseInt(bookYear),
      'author': bookAuthor,
      'finished': bookFinished == "yes" ? true : false
  };

  try {
    const { ethereum } = window

    if (ethereum) {
      const provider = new ethers.providers.Web3Provider(ethereum)
      const signer = provider.getSigner()
      const LibraryContract = new ethers.Contract(
        LibraryContractAddress,
        Library.abi,
        signer
      )

      let libraryTx = await LibraryContract.addBook(book.name, book.year, book.author, book.finished);

      console.log(libraryTx);
      console.log(book)
    } else {
      console.log("Ethereum object doesn't exist!")
    }
  } catch (error) {
    console.log('Error Submitting new Book', error)
    setTxError(error.message)
  }
};

  return (
    <div className='flex flex-col items-center bg-[#c3cbc3] text-[#6a50aa] rounded-lg  min-h-screen'>
  <div className='trasition hover:rotate-180 hover:scale-105 transition duration-500 ease-in-out'>
  </div>
  <h2 className='text-3xl font-bold mb-20 mt-12'>
    Manage your Library Catalog
  </h2>
  {currentAccount === '' ? (
    <button
    className='text-2xl font-bold py-3 px-12 bg-[#f1c232] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
    onClick={connectWallet}
    >
    Connect Wallet
    </button>
    ) : correctNetwork ? (
      <h4 className='text-3xl font-bold mb-20 mt-12'>
        Wallet Connected
      </h4>
    ) : (
    <div className='flex flex-col justify-center items-center mb-20 font-bold text-2xl gap-y-3'>
    <div>----------------------------------------</div>
    <div>Please connect to the Rinkeby Testnet</div>
    <div>and reload the page</div>
    <div>----------------------------------------</div>
    </div>
  )}
  <div className='text-xl font-semibold mb-20 mt-4 flex flex-col'>
      <input className='text-xl font-bold mb-2 mt-1 rounded-lg h-10 placeholder:text-[#a5c0ae] p-4' type="text" placeholder="Book Name" value={bookName} onChange={(e) => setBookName(e.target.value)} />
      <br/>
      <input className='text-xl font-bold mb-2 mt-1 rounded-lg h-10 placeholder:text-[#a5c0ae] p-4' type="text" placeholder="Book Author" value={bookAuthor} onChange={(e) => setBookAuthor(e.target.value)} />
      <br/>
      <input className='text-xl font-bold mb-2 mt-1 rounded-lg h-10 placeholder:text-[#a5c0ae] p-4' type="text" placeholder="Book Year" value={bookYear} onChange={(e) => setBookYear(e.target.value)} />
      <br/>
      <label>
        Have you Finished reading this book?
        <select className="ml-2 bg-[#c3cbc3] outline hover:scale-105 ease-in-out duration-300" value={bookFinished} onChange={(e) => setBookFinished(e.target.value)}>
          <option value="yes">yes</option>
          <option value="no">no</option>
        </select>
      </label >
      <br/>
      <button className='text-xl font-bold py-3 m-3 px-12 bg-[#f1329b] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
      onClick={submitBook} >
        Add Book
      </button>
  </div>
  {(
    <div className='flex flex-col justify-center items-center'>
      <div className='font-semibold text-lg text-center mb-4 '>
        Books List
      </div>
      <button className='text-xl font-bold py-3 px-12 bg-[#f1329b] rounded-lg mb-10 hover:scale-105 transition duration-500 ease-in-out'
      onClick={getBooks} >
        Get Books
      </button>
      <div className="grid grid-cols-4 ">
        {books.map((book) => (
        <Book
          key={book.id}
          id={parseInt(book.id)}
          name={book.name}
          year={parseInt(book.year).toString()}
          author={book.author}
          finished={book.finished.toString()}
          clickBookFinished={clickBookFinished}
        />
      ))}
      </div>
    </div>
  )}
</div>
  )
}

export default Home
