// スプレッドシートIDを設定
  const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ★ここにあなたのスプレッドシートIDを設定してください★
  const SHEET_NAME = 'Users'; // ユーザーデータを保存するシート名                                                                                    
   
  // 経験値とレベルのマッピング（例）                                                                                                                
  // 実際の要件に合わせて調整してください
  const LEVEL_THRESHOLDS = [                                                                                                                  
      { level: 1,  experience: 0 },
      { level: 2,  experience: 100 },
      { level: 3,  experience: 250 },                                                                                                                
      { level: 4,  experience: 500 },
      { level: 5,  experience: 1000 },                                                                                                               
      { level: 6,  experience: 2000 },                                                                                                               
      { level: 7,  experience: 3500 },
      { level: 8,  experience: 5500 },                                                                                                               
      { level: 9,  experience: 8000 },                                                                                                               
      { level: 10, experience: 11000 }
  ];                                                                                                                                                 
                  
  /**
   * ウェブアプリとしてデプロイされた際にGETリクエストを処理する関数
   * app.jsからのfetchリクエストを受け付け、適切なアクションを実行する                                                                               
   */
  function doGet(e) {                                                                                                                                
      const action = e.parameter.action;
      const username = e.parameter.username;                                                                                                         
      const points = parseInt(e.parameter.points, 10);
      const experience = parseInt(e.parameter.experience, 10);                                                                                       
                                                                                                                                                     
      let result = {};
                                                                                                                                                     
      try {       
          switch (action) {
              case 'getUserData':
                  result = getUserData(username);
                  break;
              case 'addExperience':
                  result = addExperience(username, points);
                  break;                                                                                                                             
              case 'getLevel':
                  result = calculateLevel(experience);                                                                                               
                  break;
              default:
                  throw new Error('Unknown action: ' + action);
          }
          return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);                                  
      } catch (error) {
          return ContentService.createTextOutput(JSON.stringify({ error: error.message })).setMimeType(ContentService.MimeType.JSON);                
      }                                                                                                                                              
  }
                                                                                                                                                     
  /**             
   * 指定されたユーザーの経験値とレベルを取得する
   */
  function getUserData(username) {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);                                                              
      const data = sheet.getDataRange().getValues();
      // ヘッダー行をスキップ (仮に1行目がヘッダーとする)                                                                                            
      for (let i = 1; i < data.length; i++) {                                                                                                        
          if (data[i][0] === username) { // ユーザー名が1列目にあると仮定
              const currentExperience = data[i][1] || 0; // 経験値が2列目にあると仮定、データがない場合は0                                           
              const currentLevel = calculateLevel(currentExperience).level;
              return {                                                                                                                               
                  username: username,
                  experience: currentExperience,                                                                                                     
                  level: currentLevel
              };
          }
      }
      // ユーザーが見つからない場合、新規ユーザーとして初期データを返す
      return { username: username, experience: 0, level: 1 };                                                                                        
  }
                                                                                                                                                     
  /**             
   * ユーザーに経験値を追加し、更新された経験値とレベルを返す
   */
  function addExperience(username, points) {
      const sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheetByName(SHEET_NAME);                                                              
      const data = sheet.getDataRange().getValues();
      let userFound = false;                                                                                                                         
                                                                                                                                                     
      for (let i = 1; i < data.length; i++) {
          if (data[i][0] === username) {                                                                                                             
              const currentExperience = data[i][1] || 0;
              const newExperience = currentExperience + points;                                                                                      
              sheet.getRange(i + 1, 2).setValue(newExperience); // スプレッドシートの経験値を更新
              const newLevel = calculateLevel(newExperience).level;                                                                                  
              userFound = true;                                                                                                                      
              return {
                  username: username,                                                                                                                
                  newExperience: newExperience,
                  level: newLevel
              };
          }
      }
                                                                                                                                                     
      if (!userFound) {
          // ユーザーが見つからない場合、新しい行として追加                                                                                          
          const newExperience = points;
          const newLevel = calculateLevel(newExperience).level;
          sheet.appendRow([username, newExperience]); // ユーザー名と経験値を追加
          return {                                                                                                                                   
              username: username,
              newExperience: newExperience,                                                                                                          
              level: newLevel
          };
      }
  }

  /**
   * 総経験値に基づいてレベルを計算する
   */                                                                                                                                                
  function calculateLevel(totalExperience) {
      let level = 1;                                                                                                                                 
      for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
          if (totalExperience >= LEVEL_THRESHOLDS[i].experience) {                                                                                   
              level = LEVEL_THRESHOLDS[i].level;
              break;                                                                                                                                 
          }       
      }
      return { level: level };
  }
                                                                                                                                                     
  // 補足：スプレッドシートの初期設定について
  // 1行目に「Username」「Experience」といったヘッダーを設定し、                                                                                     
  // 2行目以降にユーザー名と経験値を入力していくことを想定しています。
  // 例:                                                                                                                                             
  //   | Username | Experience |
  //   |----------|------------|                                                                                                                     
  //   | user1    | 150        |
  //   | user2    | 300        |