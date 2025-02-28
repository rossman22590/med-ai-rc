// app/api/upload/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth as clerkAuth } from "@clerk/nextjs/server";
import { db } from '@/lib/db';
import { documents, users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Check authentication directly
    const authResult = await clerkAuth();
    const clerkId = authResult.userId;
    
    if (!clerkId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // First, look up the user by their Clerk ID to get the UUID
    const userResults = await db.query.users.findMany({
      where: eq(users.clerkId, clerkId),
    });
    
    let userId: string;
    
    if (!userResults.length) {
      // Create the user if they don't exist in our database yet
      const [newUser] = await db.insert(users)
        .values({
          clerkId,
          email: authResult.sessionClaims?.email as string || 'unknown@example.com',
          name: authResult.sessionClaims?.name as string || 'User',
        })
        .returning();
        
      userId = newUser.id;
    } else {
      // Get the internal user ID (UUID)
      userId = userResults[0].id;
    }

    // Handle multipart/form-data uploads
    if (request.headers.get('content-type')?.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File;
      
      if (!file) {
        return NextResponse.json(
          { error: 'No file provided' },
          { status: 400 }
        );
      }
      
      // Generate file metadata
      const fileName = file.name;
      const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      
      // Convert file to base64
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      const fileUrl = `data:${file.type};base64,${base64}`;
      
      // Save document to database with the proper UUID
      const [document] = await db.insert(documents)
        .values({
          userId, // Use the UUID from our users table, not the Clerk ID
          name: fileName,
          type: fileType,
          url: fileUrl,
          contentText: null, // Will be processed later
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return NextResponse.json({ 
        success: true, 
        document
      });
    }
    
    // Handle JSON/base64 uploads
    else if (request.headers.get('content-type')?.includes('application/json')) {
      const { base64, fileName, fileType } = await request.json();
      
      if (!fileName || !fileType) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }
      
      // Extract document type
      const docType = fileType.includes('pdf') ? 'pdf' : 'image';
      
      // Use provided base64 or create placeholder
      const fileUrl = base64 || `data:${fileType};base64,placeholder`;
      
      // Save document to database with the proper UUID
      const [document] = await db.insert(documents)
        .values({
          userId, // Use the UUID from our users table, not the Clerk ID
          name: fileName,
          type: docType,
          url: fileUrl,
          contentText: null,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        .returning();
      
      return NextResponse.json({ 
        success: true, 
        document
      });
    }
    
    return NextResponse.json(
      { error: 'Unsupported content type' },
      { status: 400 }
    );
    
  } catch (error) {
    console.error('Upload error:', error);
    
    return NextResponse.json(
      { error: 'Failed to upload file: ' + (error as Error).message },
      { status: 500 }
    );
  }
}


// // app/api/upload/route.ts
// import { NextRequest, NextResponse } from 'next/server';
// import { auth } from '@/lib/auth';
// import { db } from '@/lib/db';
// import { documents } from '@/lib/db/schema';
// import { nanoid } from 'nanoid';

// export async function POST(request: NextRequest) {
//   // Check authentication
//   const session = await auth();
//   if (!session?.user) {
//     return NextResponse.json(
//       { error: 'Unauthorized' },
//       { status: 401 }
//     );
//   }

//   try {
//     // Handle multipart/form-data uploads
//     if (request.headers.get('content-type')?.includes('multipart/form-data')) {
//       const formData = await request.formData();
//       const file = formData.get('file') as File;
      
//       if (!file) {
//         return NextResponse.json(
//           { error: 'No file provided' },
//           { status: 400 }
//         );
//       }
      
//       // Generate a unique filename
//       const fileId = nanoid();
//       const fileName = file.name;
//       const fileType = file.type.includes('pdf') ? 'pdf' : 'image';
      
//       // Convert file to base64
//       const arrayBuffer = await file.arrayBuffer();
//       const buffer = Buffer.from(arrayBuffer);
//       const base64 = buffer.toString('base64');
//       const fileUrl = `data:${file.type};base64,${base64}`;
      
//       // Save document to database
//       const [document] = await db.insert(documents)
//         .values({
//           userId: session.user.id,
//           name: fileName,
//           type: fileType,
//           url: fileUrl,
//           contentText: null, // Will be processed later
//           createdAt: new Date(),
//           updatedAt: new Date()
//         })
//         .returning();
      
//       return NextResponse.json({ 
//         success: true, 
//         document
//       });
//     }
    
//     // Handle JSON/base64 uploads
//     else if (request.headers.get('content-type')?.includes('application/json')) {
//       const { base64, fileName, fileType } = await request.json();
      
//       if (!fileName || !fileType) {
//         return NextResponse.json(
//           { error: 'Missing required fields' },
//           { status: 400 }
//         );
//       }
      
//       // Generate ID
//       const fileId = nanoid();
      
//       // Extract document type
//       const docType = fileType.includes('pdf') ? 'pdf' : 'image';
      
//       // Use provided base64 or create placeholder
//       const fileUrl = base64 || `data:${fileType};base64,placeholder`;
      
//       // Save document to database
//       const [document] = await db.insert(documents)
//         .values({
//           userId: session.user.id,
//           name: fileName,
//           type: docType,
//           url: fileUrl,
//           contentText: null,
//           createdAt: new Date(),
//           updatedAt: new Date()
//         })
//         .returning();
      
//       return NextResponse.json({ 
//         success: true, 
//         document
//       });
//     }
    
//     return NextResponse.json(
//       { error: 'Unsupported content type' },
//       { status: 400 }
//     );
    
//   } catch (error) {
//     console.error('Upload error:', error);
    
//     return NextResponse.json(
//       { error: 'Failed to upload file: ' + (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
