import { createTheme, ThemeProvider } from '@mui/material/styles';
import './index.css';
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  OutlinedInput,
  InputAdornment,
  IconButton,
  Select,
  MenuItem,
  Checkbox,
} from "@mui/material";
import { useEffect, useRef, useState } from "react";
import MusicUploader from "./components/MusicUploader";
import WaveForm from "./components/WaveForm";
import CachedIcon from "@mui/icons-material/Cached";
import AcceptStems from "./components/Dropzone";
import { useDropzone } from "react-dropzone";
import { ApiPromise, Keyring, WsProvider } from "@polkadot/api";
import TransactionDialog from "./components/TransactionDialog";
import { Web3Storage } from "web3.storage";
import { useNavigate } from "react-router-dom";

const CryptoJS = require("crypto-js");

const StemTypes = ["Vocal", "Instrumental", "Bass", "Drums"];
const musicKeys = [
  { key: "C major", id: "CMa" },
  { key: "D♭ major", id: "DflMa" },
  { key: "D major", id: "DMa" },
  { key: "E♭ major", id: "EflMa" },
  { key: "E major", id: "EMa" },
  { key: "F major", id: "FMa" },
  { key: "F# major", id: "FshMa" },
  { key: "G major", id: "GMa" },
  { key: "A♭ major", id: "AflMa" },
  { key: "A major", id: "AMa" },
  { key: "B♭ major", id: "BflMa" },
  { key: "B major", id: "BMa" },
  { key: "C minor", id: "CMi" },
  { key: "C# minor", id: "CshMi" },
  { key: "D minor", id: "DMi" },
  { key: "E♭ minor", id: "EflMi" },
  { key: "E minor", id: "EMi" },
  { key: "F minor", id: "FMi" },
  { key: "F# minor", id: "FshMi" },
  { key: "G minor", id: "GMi" },
  { key: "G# minor", id: "GshMi" },
  { key: "A minor", id: "AMi" },
  { key: "A♭ minor", id: "AflMi" },
  { key: "B♭ minor", id: "BflMi" },
  { key: "B minor", id: "BMi" },
];

const theme = createTheme({
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
  palette: {
    text: {
      primary: '#FFF',
      secondary: '#FFF',
    },
    primary: {
      main: '#FFF',
    },
  },
  components: {
    MuiTextField: {
      defaultProps: {
        InputProps: {
          style: {
            color: "#FFF",
          },
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: "#FFF",
          },
        },
        notchedOutline: {
          borderColor: "#FFF",
        },
        input: {
          color: "#FFF",
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          color: "#FFF",
          "&.Mui-focused": {
            color: "#FFF",
          },
        },
      },
    },
  },
});

type Stem = { file: File; name: string; type: string };
type StemsObj = {
  [key: string]: Stem;
};
type Section = { name: string; start: number; end: number; bars: number };
type SectionsObj = {
  [internalId: string]: Section;
};

const getWithoutSpace = (str: string) => str.split(" ").join("");

function App() {
  const [fullTrackFile, setFullTrackFile] = useState<File>();
  const [cid, setCid] = useState<string>();
  const [artist, setArtist] = useState<string>();
  const [duration, setDuration] = useState<number>();
  const [title, setTitle] = useState<string>();
  const [album, setAlbum] = useState<string>();
  const [genre, setGenre] = useState<string>();
  const [bpm, setBpm] = useState<number>();
  const [key, setKey] = useState<string>();
  const [timeSignature, setTimeSignature] = useState<string>();
  const [noOfBeatsPerBar, setNoOfBeatsPerBar] = useState<number>(0);
  const [noOfBars, setNoOfBars] = useState<number>();
  const [noOfBeats, setNoOfBeats] = useState<number>();
  const [fileUrl, setFileUrl] = useState<string>();
  const [startBeatOffsetMs, setStartBeatOffsetMs] = useState<number>(0);
  const [durationOfEachBarInSec, setDurationOfEachBarInSec] =
    useState<number>();
  const [sectionsObj, setSectionsObj] = useState<SectionsObj>({});
  const [stemsObj, setStemsObj] = useState<StemsObj>({});

  const getSelectedBeatOffet = useRef(null);
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();
  const [activeTxStep, setActiveTxStep] = useState<number>(0);
  const [isTxDialogOpen, setIsTxDialogOpen] = useState<boolean>(false);
  const [isEncryptFiles, setIsEncryptFiles] = useState<boolean>(false);

  const [fullTrackHash, setFullTrackHash] = useState<string>();
  const [stemsHash, setStemsHash] = useState<string[]>([]);
  const [sectionsHash, setSectionsHash] = useState<string[]>([]);

  const navigate = useNavigate();

  useEffect(() => {
    if (acceptedFiles.length) {
      const obj = {} as StemsObj;
      acceptedFiles.map((acceptedFile, i) => {
        obj[i] = {
          file: acceptedFile,
          name: acceptedFile.name,
          type: StemTypes[i] || "",
        };
        return "";
      });
      setStemsObj(obj);
    }
  }, [acceptedFiles]);

  useEffect(() => {
    if (duration && bpm && timeSignature?.includes("/4")) {
      const beatsPerSecond = bpm / 60;
      const totalNoOfBeats =
        beatsPerSecond * (duration - startBeatOffsetMs / 1000);
      setNoOfBeats(totalNoOfBeats);
      const noOfBeatsPerBar = parseFloat(timeSignature.split("/")[0]);
      setNoOfBeatsPerBar(noOfBeatsPerBar);
      const noOfMeasures = Math.floor(totalNoOfBeats / noOfBeatsPerBar);
      setNoOfBars(noOfMeasures);
      const durationOfEachBar = duration / noOfMeasures;
      setDurationOfEachBarInSec(durationOfEachBar);
    }
  }, [duration, bpm, timeSignature, startBeatOffsetMs]);

  const onFetchStartBeatOffet = async () => {
    if (fileUrl) {
      const time = document.getElementsByTagName("audio")[0]?.currentTime;
      setStartBeatOffsetMs(Math.floor(time * 1000));
    }
  };

  const download = (content: any, fileName: string, contentType: string) => {
    var a = document.createElement("a");
    var file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
  };

  const onTx = async () => {
    let wsProvider;
    let api: ApiPromise;
    try {

      wsProvider = new WsProvider("ws://127.0.0.1:9944");

      api = await ApiPromise.create({
        provider: wsProvider,
        throwOnConnect: true,
      });
    } catch (e) {
      setFullTrackHash("error");
      setActiveTxStep(4);
      return;
    }
    const keyring = new Keyring({ type: "sr25519" });
    const account = keyring.addFromUri("//Alice", { name: "Alice default" });

    const titleWithoutSpace = getWithoutSpace(title as string).slice(0, 10);
    const genreWithoutSpace = getWithoutSpace(genre as string);
    const fullTrackContent = {
      id: `fulltrack${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
      cid,
      artist,
      title,
      album,
      genre,
      bpm,
      key,
      timeSignature,
      noOfBars,
      noOfBeats,
      duration,
      startBeatOffsetMs: startBeatOffsetMs.toString(),
      sections: Object.keys(sectionsObj).length,
      stems: Object.keys(stemsObj).length,
    };
    try {
      const fullTrackTxHash = await new Promise<string>((res) => {
        api.tx.templateModule
          .createFulltrack(
            `fulltrack${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
            cid,
            artist?.slice(0, 128),
            title?.slice(0, 128),
            album?.slice(0, 128),
            genre,
            bpm,
            key,
            timeSignature,
            noOfBars,
            noOfBeats,
            duration,
            startBeatOffsetMs.toString(),
            Object.keys(sectionsObj).length,
            Object.keys(stemsObj).length
          )
          .signAndSend(account, ({ events = [], status }) => {
            if (status.isFinalized) {
              console.log(
                `Transaction included at blockHash ${status.asFinalized}`
              );

              events.forEach(({ phase, event: { data, method, section } }) => {
                console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              });
              res(status.hash.toString());
            }
          });
      });
      setFullTrackHash(fullTrackTxHash);
    } catch (e) {
      alert(e);
    }
    setActiveTxStep(2);
    // Stems
    const stems = Object.values(stemsObj);
    const stemsContent = [];
    for (let i = 0; i < stems.length; i++) {
      const stemObj = stems[i];
      stemsContent.push({
        id: `stem${i + 1}${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
        cid,
        name: stemObj.name,
        type: stemObj.type,
      });
      const stemHash = await new Promise<string>((res) => {
        api.tx.templateModule
          .createStem(
            `stem${i + 1}${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
            cid,
            stemObj.name,
            stemObj.type
          )
          .signAndSend(account, ({ events = [], status }) => {
            if (status.isFinalized) {
              console.log(
                `Transaction included at blockHash ${status.asFinalized}`
              );

              events.forEach(({ phase, event: { data, method, section } }) => {
                console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              });
              res(status.hash.toString());
            }
          });
      });
      setStemsHash([...stemsHash, stemHash]);
    }
    setActiveTxStep(3);

    const sections = Object.values(sectionsObj);
    const sectionsContent = [];
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      sectionsContent.push({
        id: `section${i + 1
          }${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
        name: section.name,
        startMs: section.start * 1000,
        endMs: section.end * 1000,
        bars: section.bars,
        beats: section.bars * noOfBeatsPerBar,
      });
      const sectionHash = await new Promise<string>((res) => {
        api.tx.templateModule
          .createSection(
            `section${i + 1
            }${titleWithoutSpace}${genreWithoutSpace}${key}${bpm}`,
            section.name,
            section.start * 1000,
            section.end * 1000,
            section.bars,
            section.bars * noOfBeatsPerBar
          )
          .signAndSend(account, ({ events = [], status }) => {
            if (status.isFinalized) {
              console.log(
                `Transaction included at blockHash ${status.asFinalized}`
              );


              events.forEach(({ phase, event: { data, method, section } }) => {
                console.log(`\t' ${phase}: ${section}.${method}:: ${data}`);
              });
              res(status.hash.toString());
            }
          });
      });
      setSectionsHash([...sectionsHash, sectionHash]);
    }
    download(
      JSON.stringify({ fullTrackContent, stemsContent, sectionsContent }),
      "Metadata.json",
      "text/plain"
    );
    setActiveTxStep(4);
  };


  const onTxClick = async () => {
    if (!fullTrackFile) {
      alert("Upload Full Track.");
      return;
    } else if (acceptedFiles.length === 0) {

    }
    setIsTxDialogOpen(true);
    const stemFiles: File[] = Object.values(stemsObj).map((obj) => obj.file);
    const allFiles = [fullTrackFile, ...stemFiles];
    let finalFiles;
    if (isEncryptFiles) {
      finalFiles = await encryptFiles(allFiles);
    } else {
      finalFiles = allFiles;
    }
    const client = new Web3Storage({
      token: process.env.REACT_APP_WEB3_STORAGE as string,
    });
    const cid = await client.put(finalFiles);
    setCid(cid);

    setActiveTxStep(1);
  };
  useEffect(() => {
    if (cid) {
      onTx();
    }

  }, [cid]);

  const encryptFiles = async (files: File[]): Promise<File[]> => {
    const filePromises = files.map((file) => {
      return new Promise<File>((res) => {
        const reader = new FileReader();
        reader.addEventListener("load", (event: any) => {
          const buff = event.target.result;
          var wordArray = CryptoJS.lib.WordArray.create(buff);
          var encrypted = CryptoJS.AES.encrypt(
            wordArray,
            process.env.REACT_APP_ENCRYPTION_KEY
          ).toString();
          const newEncryptedFile = new File([encrypted], file.name);
          res(newEncryptedFile);
        });
        reader.readAsArrayBuffer(file);
      });
    });
    return Promise.all(filePromises);

  };
  const onTxDialogClose = () => {
    setIsTxDialogOpen(false);
    navigate("/");
  };

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          position: 'relative',
          bgcolor: "background.paper",
          minHeight: "100vh",
          backgroundImage: "url('/bg1.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',  
        }}
      >
        <div style={{
          background: 'rgba(255, 255, 255, 0.10)',
          backdropFilter: 'blur(25px)',
          padding: '15px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: "'Inter', sans-serif",
          fontSize: '16px',
          position: 'relative'
        }} id="page-2">
          <div style={{ display: 'flex', alignItems: 'center', marginRight: 'auto', marginLeft: '10px' }}>
            <img src="/melobyte_white.png" alt="Melobyte Logo" style={{ width: '50px', height: 'auto', marginRight: '10px' }} />
            <span style={{ color: '#FFF', fontSize: '20px' }}>Melobyte</span>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginRight: '10px',
            flex: 1,
            justifyContent: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}>
            <a href="#" style={{
              margin: '0 15px',
              textDecoration: 'none',
              color: '#FFF',
              transition: 'color 0.3s'
            }}
              onMouseOver={(e) => (e.target as HTMLElement).style.color = '#aaa'}
              onMouseOut={(e) => (e.target as HTMLElement).style.color = '#FFF'}

            >Home</a>
            <a href="#" style={{
              margin: '0 15px',
              textDecoration: 'none',
              color: '#FFF',
              transition: 'color 0.3s'
            }}
              onMouseOver={(e) => (e.target as HTMLElement).style.color = '#aaa'}
              onMouseOut={(e) => (e.target as HTMLElement).style.color = '#FFF'}

            >Creator Upload</a>
            <a href="#" style={{
              margin: '0 15px',
              textDecoration: 'none',
              color: '#FFF',
              transition: 'color 0.3s'
            }}
              onMouseOver={(e) => (e.target as HTMLElement).style.color = '#aaa'}
              onMouseOut={(e) => (e.target as HTMLElement).style.color = '#FFF'}

            >Github</a>
            <a href="#" style={{
              margin: '0 15px',
              textDecoration: 'none',
              color: '#FFF',
              transition: 'color 0.3s'
            }}
              onMouseOver={(e) => (e.target as HTMLElement).style.color = '#aaa'}
              onMouseOut={(e) => (e.target as HTMLElement).style.color = '#FFF'}

            >Soroban</a>
          </div>
        </div>
        <Box p={{ xs: 4, md: 10 }}>
          <Grid container mt={8} gap={{ xs: 2 }}>
            <Grid item xs={12} md={7}>
              <Grid container gap={2}>
                <Grid item xs={10} md={4}>
                  <Box display="flex" justifyContent="start">
                    <Box>
                      <Typography fontWeight="bold" color="White">
                        Artist:
                      </Typography>
                      <TextField
                        variant="outlined"
                        onChange={(e: any) => setArtist(e.target.value)}
                      ></TextField>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box display="flex" justifyContent="start">
                    <Box>
                      <Typography fontWeight="bold" color="White">
                        Track Title:
                      </Typography>
                      <TextField
                        variant="outlined"
                        onChange={(e: any) => setTitle(e.target.value)}
                      ></TextField>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Album Name:
                    </Typography>
                    <TextField
                      variant="outlined"
                      onChange={(e: any) => setAlbum(e.target.value)}
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Genre:
                    </Typography>
                    <TextField
                      variant="outlined"
                      onChange={(e: any) => setGenre(e.target.value)}
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Key:
                    </Typography>
                    {/* <TextField
                    variant="outlined"
                    onChange={(e: any) => setKey(e.target.value)}
                  ></TextField> */}
                    <Select
                      variant="outlined"
                      onChange={(e: any) => setKey(e.target.value)}
                      style={{
                        color: 'black',           // Text color
                        borderColor: 'black',     // Border color if using the outlined variant
                      }}
                    >
                      {musicKeys.map(({ key, id }) => {
                        return (
                          <MenuItem value={id} style={{ color: 'black' }}>
                            {key.toUpperCase()}
                          </MenuItem>
                        );
                      })}
                      {/*
  <MenuItem value={"Drums"} style={{ color: 'black' }}>
    Drums
  </MenuItem>
  */}
                    </Select>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <MusicUploader
                      fullTrackFile={fullTrackFile}
                      setFullTrackFile={setFullTrackFile}
                      setFileUrl={setFileUrl}
                      setDuration={setDuration}
                    />
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Duration:
                    </Typography>
                    <TextField
                      variant="outlined"
                      value={duration}
                      disabled
                      placeholder="(fetched from upload)"
                      className="white-outline"
                      InputProps={{
                        style: { color: "white" },
                        inputProps: {
                          style: { color: "white" }
                        }
                      }}
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>

                    <Box>
                      <Typography fontWeight="bold" color="White">
                        Album Cover Uploader
                      </Typography>
                      <Box pt={1}>
                        <Button
                          variant="outlined"
                          component="label"
                          style={{
                            backgroundImage: 'linear-gradient(to right, #06DBAC, #BD00FF)',
                            color: 'white',
                            border: 'none'
                          }}
                        >
                          Upload
                          <input type="file" hidden />
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Bpm:
                    </Typography>
                    <TextField
                      variant="outlined"
                      type={"number"}
                      onChange={(e: any) => setBpm(parseInt(e.target.value))}
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      XLM:
                    </Typography>
                    <TextField
                      variant="outlined"
                      onChange={(e: any) => setTimeSignature(e.target.value)}
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      No of Measures:
                    </Typography>
                    <TextField
                      className="white-outline"
                      variant="outlined"
                      type="number"
                      value={noOfBars}
                      disabled
                    ></TextField>
                  </Box>
                </Grid>
                <Grid item xs={10} md={4}>
                  <Box>
                    <Typography fontWeight="bold" color="White">
                      Encrypt Assets:
                    </Typography>
                    <Checkbox
                      value={isEncryptFiles}
                      onChange={(e) => setIsEncryptFiles(e.target.checked)}
                      sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            <Grid item xs={12} md={4}>
              <Box>
                <Box
                  style={{
                    backgroundColor: "var(--white-10, rgba(255, 255, 255, 0.10))",
                    color: "white",
                    borderRadius: "8px",
                    fontFamily: "Roboto",
                    padding: "2em" 
                  }}
                >
                  <Typography variant="h4" fontWeight="bold" p={1} color="inherit" textAlign="center">
                    Metadata Information
                  </Typography>
                  <Grid container>
                    {['Artist', 'Track Title', 'Album', 'Genre', 'Bpm', 'Key', 'XLM', 'No Of Measures', 'Duration', 'Start Beat Offset', 'Music Cid'].map((label, index) => (
                      <Grid item xs={12} key={label}>
                        <Box p={1} display="flex" alignItems={"center"} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.5)" }}> {/* Made the line fainter with 0.5 opacity */}
                          <Box flexBasis={{ xs: "70%", md: "40%" }}>
                            <Typography fontWeight="bold" color="inherit">
                              {label}:
                            </Typography>
                          </Box>
                          <Box>
                            <Typography color="inherit">
                              {(() => {
                                switch (label) {
                                  case 'Artist': return artist;
                                  case 'Track Title': return title;
                                  case 'Album': return album;
                                  case 'Genre': return genre;
                                  case 'Bpm': return bpm;
                                  case 'Key': return key;
                                  case 'XLM': return timeSignature;
                                  case 'No Of Measures': return noOfBars;
                                  case 'Duration': return duration;
                                  case 'Start Beat Offset': return startBeatOffsetMs;
                                  case 'Music Cid': return cid;
                                  default: return '';
                                }
                              })()}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Box>
            </Grid>
          </Grid>
          <WaveForm
            url={fileUrl}
            durationOfEachBarInSec={durationOfEachBarInSec}
            noOfBars={noOfBars}
            startBeatOffsetMs={startBeatOffsetMs}
            getSelectedBeatOffet={getSelectedBeatOffet}
            sectionsObj={sectionsObj}
            setSectionsObj={setSectionsObj}
          />
          <Box mt={8}>
            <Typography fontWeight="bold" variant="h6" color="White">
              Proof of Creation:
            </Typography>
            <Box mt={4} display="flex" justifyContent="center">
              <AcceptStems
                getRootProps={getRootProps}
                getInputProps={getInputProps}
              />
            </Box>
            <Box
              mt={4}
              display="flex"
              gap={2}
              justifyContent="center"
              flexWrap="wrap"
            >
              {Object.values(stemsObj).map(({ file, name, type }, i) => (
                <Box>
                  <Box display="flex" justifyContent="center">
                    <Select
                      size="small"
                      value={type}
                      onChange={(e) => {
                        const newObject = { ...stemsObj };
                        newObject[i].type = String(e.target.value);
                        setStemsObj(newObject);
                      }}
                    >
                      <MenuItem value={"Vocal"}>Vocal</MenuItem>
                      <MenuItem value={"Instrumental"}>Instrumental</MenuItem>
                      <MenuItem value={"Bass"}>Bass</MenuItem>
                      <MenuItem value={"Drums"}>Drums</MenuItem>
                    </Select>
                  </Box>
                  <Box mt={2}>
                    <TextField
                      placeholder="Name"
                      value={name}
                      onChange={(e) => {
                        const newObject = { ...stemsObj };
                        newObject[i].name = e.target.value;
                        setStemsObj(newObject);
                      }}
                    ></TextField>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
          <Box mt={8} display="flex" justifyContent="center">
            <Button
              variant="contained"
              onClick={onTxClick}
              style={{
                backgroundImage: 'linear-gradient(to right, #06DBAC, #BD00FF)',
                color: 'white', 
              }}
            >
              Send To Blockchain
            </Button>
          </Box>
        </Box>
        <TransactionDialog
          isTxDialogOpen={isTxDialogOpen}
          activeTxStep={activeTxStep}
          onTxDialogClose={onTxDialogClose}
          fullTrackHash={fullTrackHash}
          stemsHash={stemsHash}
          sectionsHash={sectionsHash}
          isEncryptFiles={isEncryptFiles}
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;