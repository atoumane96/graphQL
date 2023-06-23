const express = require('express');
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');

// Schéma GraphQL
const schema = buildSchema(`
  type Student {
    id: ID!
    firstName: String!
    lastName: String!
    dateOfBirth: String!
    age: Int!
    address: String!
    nationality: String!
    email: String
    phone: String
  }

  type Query {
    students: [Student!]!
    student(id: ID!): Student
  }

  type Mutation {
    addStudent(firstName: String!, lastName: String!, dateOfBirth: String!, address: String!, nationality: String!, email: String, phone: String): Student!
    updateStudent(id: ID!, firstName: String, lastName: String, dateOfBirth: String, address: String, nationality: String, email: String, phone: String): Student!
    deleteStudent(id: ID!): Student
  }
`);

// Données de test (remplacez-les par votre propre source de données)
let studentsData = [
  {
    id: '1',
    firstName: 'Aminata',
    lastName: 'Diop',
    dateOfBirth: '1995-06-15',
    address: '123 Rue Principale',
    nationality: 'Sénégalaise',
    email: 'aminata.diop@example.com',
    phone: '+221 12345678'
  },
  {
    id: '2',
    firstName: 'Mamadou',
    lastName: 'Sow',
    dateOfBirth: '1998-03-22',
    address: '456 Avenue des Fleurs',
    nationality: 'Sénégalais',
    email: 'mamadou.sow@example.com',
    phone: '+221 87654321'
  },
];

// Résolveurs pour les requêtes GraphQL
const root = {
  students: () => studentsData,
  student: ({ id }) => studentsData.find(student => student.id === id),
  addStudent: ({ firstName, lastName, dateOfBirth, address, nationality, email, phone }) => {
    const newStudent = {
      id: String(studentsData.length + 1),
      firstName,
      lastName,
      dateOfBirth,
      address,
      nationality,
      email,
      phone,
    };
    studentsData.push(newStudent);
    return newStudent;
  },
  updateStudent: ({ id, firstName, lastName, dateOfBirth, address, nationality, email, phone }) => {
    const studentIndex = studentsData.findIndex(student => student.id === id);
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }
    studentsData[studentIndex] = {
      ...studentsData[studentIndex],
      firstName: firstName || studentsData[studentIndex].firstName,
      lastName: lastName || studentsData[studentIndex].lastName,
      dateOfBirth: dateOfBirth || studentsData[studentIndex].dateOfBirth,
      address: address || studentsData[studentIndex].address,
      nationality: nationality || studentsData[studentIndex].nationality,
      email: email || studentsData[studentIndex].email,
      phone: phone || studentsData[studentIndex].phone,
    };
    return studentsData[studentIndex];
  },
  deleteStudent: ({ id }) => {
    const studentIndex = studentsData.findIndex(student => student.id === id);
    if (studentIndex === -1) {
      throw new Error('Student not found');
    }
    const deletedStudent = studentsData[studentIndex];
    studentsData.splice(studentIndex, 1);
    return deletedStudent;
  },
};

// Créer une application Express
const app = express();

// Endpoint GraphQL
app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: root,
  graphiql: true // Active l'interface GraphiQL pour les tests
}));

// Ajouter un étudiant via une URL
app.post('/students', express.json(), (req, res) => {
  const { firstName, lastName, dateOfBirth, address, nationality, email, phone } = req.body;
  const newStudent = root.addStudent({ firstName, lastName, dateOfBirth, address, nationality, email, phone });
  res.json(newStudent);
});

// Mettre à jour un étudiant via une URL
app.put('/students/:id', express.json(), (req, res) => {
  const { id } = req.params;
  const { firstName, lastName, dateOfBirth, address, nationality, email, phone } = req.body;
  const updatedStudent = root.updateStudent({ id, firstName, lastName, dateOfBirth, address, nationality, email, phone });
  res.json(updatedStudent);
});

// Supprimer un étudiant via une URL
app.delete('/students/:id', (req, res) => {
  const { id } = req.params;
  const deletedStudent = root.deleteStudent({ id });
  res.json(deletedStudent);
});

// Port d'écoute du serveur
const port = 3000;

// Démarrer le serveur
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
