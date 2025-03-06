const emailHeader = (title) => {
    return `
   <!doctype html>
  <html lang="en-US">
  
  <head>
      <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
      <title>${title}</title>
      <meta name="description" content="Email From capTask .">
      <style type="text/css">
          a:hover {
              text-decoration: underline !important;
          }
      </style>
  </head>
  
  <body marginheight="0" topmargin="0" marginwidth="0" style="margin: 0px; background-color: #f2f3f8;" leftmargin="0">
      <!-- 100% body table -->
      <table cellspacing="0" border="0" cellpadding="0" width="100%" bgcolor="#f2f3f8"
          style="@import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700); font-family: 'Open Sans', sans-serif;">
          <tr>
              <td>
                  <table style="background-color: #f2f3f8; max-width:670px; margin:0 auto;" width="100%" border="0"
                      align="center" cellpadding="0" cellspacing="0">
                      <tr>
                          <td style="height:25px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td style="height:20px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td>
                              <table width="95%" border="0" align="center" cellpadding="0" cellspacing="0"
                                  style="max-width:670px; background:#fff; border-radius:3px; text-align:center;-webkit-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);-moz-box-shadow:0 6px 18px 0 rgba(0,0,0,.06);box-shadow:0 6px 18px 0 rgba(0,0,0,.06);">
                                  <tr>
                                      <td style="height:40px;">&nbsp;</td>
                                  </tr>
  
                                  <tr>
                                      <td style="padding:0 35px;">
                                          <h1
                                              style="color:#1e1e2d; font-weight:500; margin:0;font-size:20px;font-family:'Rubik',sans-serif;">
                                              ${title}
                                          </h1>
        `;
  };
  
  const emailFooter = () => {
    return `
         <p
                                              style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
                                              Best Regards
                                          </p>
                                          <p
                                              style="color:#455056; font-size:14px;line-height:24px; margin-top:10px; text-align: left;">
                                              <strong>CapTask Admin</strong> 
                                              <br>
                                              captask@gmail.com | +234-8085258229
                                          </p>
                                          
                                      </td>
                                  </tr>
  
                                  <tr>
                                      <td style="height:40px;">&nbsp;</td>
                                  </tr>
                              </table>
                          </td>
                      </tr>
                      <tr>
                          <td style="height:20px;">&nbsp;</td>
                      </tr>
                      <tr>
                          <td style="text-align:center;">
                              <p
                                  style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                  Copyright; <strong>CapTask</strong> </p>
                          </td>
                      </tr>
                      <tr>
                          <td style="text-align:center;">
                              <p
                                  style="font-size:14px; color:rgba(69, 80, 86, 0.7411764705882353); line-height:18px; margin:0 0 0;">
                                  <a href="https://ex.com/unsubscribe" target='_blank'>Unsubscribe</a>
                              </p>
                          </td>
                      </tr>
                      <tr>
                          <td style="height:25px;">&nbsp;</td>
                      </tr>
                  </table>
              </td>
          </tr>
      </table>
      <!--/100% body table-->
  </body>
  
  </html>
    
        `;
  };

  export const SendDailyTaskReport = () => {
    return `
       ${emailHeader("Employees Daily Tasks Report")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear Sir,
       </p>

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
          Below is the Attachment Link for today's employees Task report
        </p>

      
           <p
            style="background:#20104B;text-decoration:none !important; font-weight:500; margin-top:35px; color:#fff;text-transform:uppercase; font-size:14px;padding:10px 14px;display:inline-block;border-radius:50px; letter-spacing:1px;"><a href=${process.env.BACKEND_BASE_URL
            }/api/task/excel/export-today-task} style="text-decoration: none; color: white;" > Download Report </a>
           </p>
          
    
        ${emailFooter()}
     `;
  }

  export const SendPasswordToUser = (user) => {
    return `
       ${emailHeader("Account Login Details")}

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left; font-weight: bold;">
           Dear ${user.firstName},
       </p>

        <p style="color:#455056; font-size:15px;line-height:24px; margin-top:10px; text-align: left;">
         Use the credentials below to Log into your Task Management Application.
        </p>

         <ul style=" margin: 0; text-align: left; list-style: none;">
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">URL:</span>
                    <span> ${process.env.FRONTEND_BASE_URL}/login </span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Email:</span>
                    <span>${user.email} </span>
                 </li>
                <li style="margin-bottom: 15px;">
                    <span style="font-weight: bold; margin-right: 10px;">Email:</span>
                    <span>${process.env.DEFAULT_PASSWORD} </span>
                 </li>
                                              
          </ul>

          
        ${emailFooter()}
     `;
  }