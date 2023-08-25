import { Request, Response, NextFunction } from "express";
import { TweetModel } from "../data/tweet.data";

//---TODO Save tweet

 // req: Gelen HTTP isteği, res: Yanıt nesnesi, next: Sonraki middleware fonksiyonu
export const saveTweet = (req: Request, res: Response, next: NextFunction) => {
  try {
    // create metodu ile yeni bir tweet oluşturuluyor
    TweetModel.create({
      userName: req.body.userName,
      content: req.body.content,
    })
      .then((result) => { // Tweet oluşturma işlemi başarılı olduysa bu bölüm çalışacak.
        if (result) {
          res.sendStatus(200);
        }
      })
      .catch((exception) => { //hatalı ise bu kısım çalışacak
        console.error(exception);
        res.sendStatus(404);
      });
  } catch (error) {   //genel bir haatada burası çalışacak
    console.error(error);
    res.sendStatus(500);
  }
};

//---TODO Update tweet - Only the user call (Middleware)
export const updateTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //istek yapılan kullanıcının adı alınır
    const userName = res.locals.username;
    //güncellenecek verinin id
    const tweetId = req.body.id as string;
    //güncellenecek içerik
    const updatedContent = req.body.updatedContent;

    //tweeti güncelle
    const updatedTweet = await TweetModel.findOneAndUpdate(
      //güncellencek kişi kontrol edilir
      //İlk JSON Verisi (Koşul)
      { tweetId: tweetId, userName: userName, isDeleted: false }, // isDeleted: false, soft delete
      //güncelleme işlemi yapılır
      //İkinci JSON Verisi (Güncelleme)
      { tweet: updatedContent },
      // Güncellenmiş belgeyi döndür
      //Üçüncü JSON Verisi (Seçenekler)
      { new: true }
    );

    if (updatedTweet) {
      res.sendStatus(200); //güncelleme başarılı
    } else {
      res.sendStatus(404); // Güncellenmek istenen tweet bulunamadı
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Sunucu hatası
  }
};

//---TODO Delete (Soft delete) tweet - Only the user call (Middleware)
export const deleteTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //giriş yapmış kişi ıd alınır
    const userName = res.locals.username;
    //tweet ıd alınır
    const tweetId = req.body.id as string;

    //Tweet bul ve güncelle kullanılır.
    const deletedTweet = await TweetModel.findOneAndUpdate(
      { tweetId: tweetId, userName: userName, isDeleted: false }, // Kullanıcının tweetini bul
      { isDeleted: true }, // Tweeti sil (yumuşak silme)
      { new: true } // Silinmiş belgeyi döndür
    );

    if (deletedTweet) {
      res.sendStatus(200); //güncelleme başarılı
    } else {
      res.sendStatus(404); // Silinmek istenen tweet bulunamadı
    }
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Sunucu hatası
  }
};

//---TODO Get All tweet
export const getAllTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //Model üzerinde bütün tweetler bulunur, find ile
    //isDeleted : false olanlar silinmemiştir, seçilir.
    const allTweets = await TweetModel.find({ isDeleted: false });

    if (allTweets) res.status(200).json(allTweets); //başarılı
    else res.sendStatus(404); // getirilmek istenen tweetler bulunamadı
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Sunucu hatası
  }
};

//+++TODO Get User's tweet - Only the user call (Middleware)
export const getUserTweets = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //tweet ıd alınır
    const tweetId = req.body.id as string;

    //kullanıcı adına ait ve silinmemiş tweetler veritabanında aranır.
    const userTweets = await TweetModel.find({
      tweetId: tweetId, //id olarak değiştir.
      isDeleted: false,
    });

    if (userTweets) res.status(200).json(userTweets); //başarılı
    else res.sendStatus(404); // getirilmek istenen tweet bulunamadı
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Sunucu hatası
  }
};

//TODO Like tweet tweet - Except from user (Middleware)
export const likeTweet = (req: Request, res: Response, next: NextFunction) => {
  try {
    //giriş yapmış kişi ıd alınır
    const userName = res.locals.username;
    //tweet ıd alınır
    const tweetId = req.body.id as string;

    //belirtilen id ve silinmemeişler alınır.daha önce beğenilmediğini kontrol eder.
    TweetModel.findOneAndUpdate(
      {
        tweetId: tweetId,
        isDeleted: false,
        "likedBy.username": { $ne: userName }, //$ne (Mongodb içeriinde kullanılan sorgudur)= not equal
      }, // Kullanıcı daha önce beğenmediyse
      { $push: { likedBy: { username: userName } } }, // Beğeni ekle
      { new: true }
    )
      .then((result) => {
        if (result) {
          res.sendStatus(200); //güncelleme başarılı
        } else {
          res.sendStatus(404);
        }
      })
      .catch((error) => {
        console.error(error);
        res.sendStatus(500); // Sunucu hatası
      });
  } catch (error) {
    console.error(error);
    res.sendStatus(500); // Sunucu hatası
  }
};

//---TODO Add comment to own tweet
export const addCommentToOwnTweet = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    //giriş yapmış kişinin Id'si alınır
    const userName = res.locals.username;
    //tweet Id alınır
    const tweetId = req.body.tweet;
    //tweet Id ile tweet bulma
    const tweet = await TweetModel.findById(tweetId);

    //tweet yoksa 404 hatası
    if (!tweet) {
      return res.status(404).json();
    }

    if (tweet.userName !== userName) {
      return res
        .status(401) //kullanıcı yetkisi yok
        .json({ error: "You are not allowed to comment your own tweets" });
    }

    //yorum oluşturulur
    const newComment = {
      userId: userName.userId,
      userName: userName,
      comment: req.body.comment,
    };

    tweet.comments.push(newComment);
    //veritabanında güncelleniyor.
    await tweet.save();

    res
      .status(200) //başarılı
      .json({ status: "success", message: "Comment Added successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to add comment to the tweet" }); // Sunucu hatası
  }
};
